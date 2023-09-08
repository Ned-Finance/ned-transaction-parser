import { prettyLog } from "@app/utils/common/logging";
import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction, SolanaParser as SolanaParserCore, parseLogs as parseLogsParser } from "@debridge-finance/solana-transaction-parser";
import { Connection, Finality, Message, VersionedMessage } from "@solana/web3.js";
import _ from "lodash";
import { humanizeUnknown } from "./humanize/fn/unknown";
import { ReadableParsedInstruction, ReadableParsedTransaction } from "./humanize/types";
import jupiterTransaction from "./inference/jupiterTransaction";
import splTransfer from "./inference/splTransfer";
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

    private async inferTransactionType(instructions: ReadableParsedInstruction[]): Promise<ReadableParsedTransaction> {
        // console.log('prettyLog.info', prettyLog.debug.caller)
        prettyLog.info('Starting inference...')
        prettyLog.debug(instructions)
        const fns = [
            jupiterTransaction,
            splTransfer,
            unknown
        ]

        const transactionsParsed = await Promise.all(
            fns.map(fn =>
                fn({
                    instructions,
                    tokens: this._tokens ? this._tokens : [],
                    walletAddress: this._walletAddress,
                    connection: this._connection
                }))
        )

        prettyLog.info('Inference ended...')
        console.log('transactionsParsed', transactionsParsed)
        const partialTx = _.first(transactionsParsed.filter(t => !_.isNull(t))) as Partial<ReadableParsedTransaction>
        return {
            type: partialTx.type!,
            data: partialTx.data!,
            instructions
        }

    }

    private async nedParser(instructions: ParsedInstruction<Idl, string>[]): Promise<ReadableParsedTransaction> {
        const knownPrograms = (protocolsPrograms as Program[]).concat(solanaPrograms as Program[])

        const parsedInstructions = await this.parseProgramInstructions(instructions, knownPrograms)
        return this.inferTransactionType(parsedInstructions)
    }

    async parseTransaction(txId: string, commitment?: Finality): Promise<ReadableParsedTransaction | null> {
        prettyLog.info('Start parsing transaction %s', txId)
        const parsedInstructions = await this._txParser.parseTransaction(this._connection, txId, true, commitment)
        // console.log('parsedInstructions ===>', JSON.stringify(parsedInstructions, undefined, 2))
        if (parsedInstructions)
            return await this.nedParser(parsedInstructions)
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
