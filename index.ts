import { prettyLog } from "@app/utils/common/logging";
import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction, SolanaParser as SolanaParserCore, flattenTransactionResponse, parseLogs as parseLogsParser } from "@debridge-finance/solana-transaction-parser";
import { Connection, Finality, Message, VersionedMessage } from "@solana/web3.js";
import _ from "lodash";
import { humanizeUnknown } from "./humanize/fn/unknown";
import { InferenceFnProps, InferenceResult, InferenceSucess, ReadableParsedInstruction, ReadableParsedTransaction } from "./humanize/types";
import jupiterTransaction from "./inference/jupiterTransaction";
import jupiterTransactionV2 from "./inference/jupiterTransactionV2";
import jupiterTransactionV4 from "./inference/jupiterTransactionV4";
import solTransfer from "./inference/solTransfer";
import splTransfer from "./inference/splTransfer";
import splTransferMultiple from "./inference/splTransferMultiple";
import unknown from "./inference/unknown";
import protocolsPrograms from './protocols/programs';
import solanaPrograms from "./protocols/solana";
import { Program } from "./protocols/types";

export type SolanaParserToken = {
    name: string,
    address: string,
    symbol: string,
    decimals: number,
    logoURI: string,
}

export type SolanaParserConfig = {
    connection: Connection,
    walletAddress?: string,
    tokens?: SolanaParserToken[]
}


export default class SolanaParser {

    private _txParser: SolanaParserCore;
    private _connection: Connection
    private _walletAddress?: string
    private _tokens?: SolanaParserToken[]

    constructor(config: SolanaParserConfig) {
        this._connection = config.connection
        this._walletAddress = config.walletAddress
        this._tokens = config.tokens
        this._txParser = new SolanaParserCore(protocolsPrograms);
    }

    private async parseProgramInstructions(instructions: ParsedInstruction<Idl, string>[], programs: Program[]): Promise<ReadableParsedInstruction[]> {

        const programsFound: Program[] = instructions.map(
            instruction => programs.find(
                program => {
                    // console.log('----->', instruction.programId.toBase58() == program.programId, program.programId)
                    return instruction.programId.toBase58() == program.programId
                })).filter(program => !_.isUndefined(program)) as Program[]

        // console.log('programsFound ===>', programs)

        const parsed: Promise<ReadableParsedInstruction | undefined>[] = instructions.map((instruction) => {
            const program = programsFound.find(p => p.programId == instruction.programId.toBase58())
            if (program)
                return program!.humanizeFn(instruction, this._connection)
            else
                return this.parseUnknownInstructions(instruction)
        })


        return (await Promise.all(parsed)).filter(p => !_.isUndefined(p)) as ReadableParsedInstruction[]
    }

    private async parseUnknownInstructions(instruction: ParsedInstruction<Idl, string>): Promise<ReadableParsedInstruction> {

        // return await Promise.all(instructions.map(async (instruction) => {
        return new Promise<ReadableParsedInstruction>(async (resolve, reject) => {
            const parsed = await humanizeUnknown(instruction)
            resolve({
                data: parsed.data!,
                type: 'UNKNOWN',
                relevance: 'SECONDARY'
            })
        })
        // }))
    }

    private async inferTransactionType(instructions: ReadableParsedInstruction[]): Promise<InferenceSucess> {
        // console.log('prettyLog.info', prettyLog.debug.caller)
        prettyLog.info('Starting inference...')
        prettyLog.debug(instructions)

        const fns = [
            jupiterTransaction,
            jupiterTransactionV2,
            jupiterTransactionV4,
            splTransfer,
            solTransfer,
            splTransferMultiple,
            unknown
        ]

        const firstNonNull = async (fns: ((props: InferenceFnProps) => Promise<InferenceResult>)[], index: number): Promise<InferenceSucess | null> => {
            if (index < fns.length) {
                const result = await fns[index]({
                    instructions,
                    tokens: this._tokens ? this._tokens : [],
                    walletAddress: this._walletAddress,
                    connection: this._connection
                })

                // console.log('result ===>', result)
                if (!_.isNull(result)) {
                    // console.log('no es null ===>', result)
                    return result
                } else {
                    // console.log('es null sigue llamando ===>', result)
                    return await firstNonNull(fns, index + 1)
                }
            } else return null

        }

        // console.log('::: start transactionsParsed')
        const result = await firstNonNull(fns, 0) as InferenceSucess
        // console.log('result', result)
        // console.log('::: end transactionsParsed')
        return result
        // console.log('::: start transactionsParsed')
        // const transactionsParsed = await Promise.all(
        //     fns.map(fn =>
        //         fn({
        //             instructions,
        //             tokens: this._tokens ? this._tokens : [],
        //             walletAddress: this._walletAddress,
        //             connection: this._connection
        //         }))
        // )
        // console.log('::: end transactionsParsed')

        // prettyLog.info('Inference ended...')
        // const parsed = _.first(transactionsParsed.filter(t => !_.isNull(t))) as InferenceSucess
        // return parsed

    }

    private async nedParser(instructions: ParsedInstruction<Idl, string>[]): Promise<InferenceSucess & { instructions: ReadableParsedInstruction[] }> {
        const knownPrograms = (protocolsPrograms as Program[]).concat(solanaPrograms as Program[])

        const parsedInstructions = await this.parseProgramInstructions(instructions, knownPrograms)
        const inferenceTransactions = await this.inferTransactionType(parsedInstructions)

        return {
            ...inferenceTransactions,
            instructions: parsedInstructions
        }
    }

    async parseTransaction(txId: string, commitment?: Finality): Promise<ReadableParsedTransaction | null> {
        prettyLog.info('Start parsing transaction %s', txId)

        const transaction = await this._connection.getTransaction(txId, { commitment: commitment, maxSupportedTransactionVersion: 0 });
        if (!transaction) return null;
        const parsedInstructions = flattenTransactionResponse(transaction).map((ix) => this._txParser.parseInstruction(ix));
        if (parsedInstructions)
            return {
                ...(await this.nedParser(parsedInstructions)),
                date: transaction.blockTime,
                fee: transaction.meta?.fee,
                txId,
                success: _.isNull(transaction.meta?.err)
            }
        else return null
    }

    async parseInstruction<T extends Message | VersionedMessage>(message: T): Promise<ReadableParsedTransaction> {
        const parsedInstructions = this._txParser.parseTransactionData(message)
        return await this.nedParser(parsedInstructions!)
    }

    parseLogs(logs: string[]) {
        return parseLogsParser(logs)
    }

    parseTransactionDump(txDump: string | Buffer) {
        const parsedInstruction = this._txParser.parseTransactionDump(txDump)
        return parsedInstruction
    }
}
