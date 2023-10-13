import { SolanaParser as SolanaParserCore, flattenTransactionResponse, parseLogs as parseLogsParser, } from "@debridge-finance/solana-transaction-parser";
import _ from "lodash";
import { humanizeUnknown } from "./humanize/fn/unknown";
import jupiterTransaction from "./inference/jupiterTransaction";
import jupiterTransactionV2 from "./inference/jupiterTransactionV2";
import jupiterTransactionV4 from "./inference/jupiterTransactionV4";
import solTransfer from "./inference/solTransfer";
import splTransfer from "./inference/splTransfer";
import splTransferMultiple from "./inference/splTransferMultiple";
import unknown from "./inference/unknown";
import protocolsPrograms from "./protocols/programs";
import solanaPrograms from "./protocols/solana";
export default class SolanaParser {
    constructor(config) {
        this._connection = config.connection;
        this._walletAddress = config.walletAddress;
        this._tokens = config.tokens;
        this._txParser = new SolanaParserCore(protocolsPrograms);
    }
    async parseProgramInstructions(instructions, programs) {
        const programsFound = instructions
            .map((instruction) => programs.find((program) => {
            return instruction.programId.toBase58() == program.programId;
        }))
            .filter((program) => !_.isUndefined(program));
        const parsed = instructions.map((instruction) => {
            const program = programsFound.find((p) => p.programId == instruction.programId.toBase58());
            if (program)
                return program.humanizeFn(instruction, this._connection);
            else
                return this.parseUnknownInstructions(instruction);
        });
        return (await Promise.all(parsed)).filter((p) => !_.isUndefined(p));
    }
    async parseUnknownInstructions(instruction) {
        return new Promise(async (resolve) => {
            const parsed = await humanizeUnknown(instruction);
            resolve({
                data: parsed.data,
                type: "UNKNOWN",
                relevance: "SECONDARY",
            });
        });
        // }))
    }
    async inferTransactionType(instructions) {
        // console.debug('Starting inference...')
        // console.debug(instructions)
        const fns = [
            jupiterTransaction,
            jupiterTransactionV2,
            jupiterTransactionV4,
            splTransfer,
            solTransfer,
            splTransferMultiple,
            unknown,
        ];
        const firstNonNull = async (fns, index) => {
            if (index < fns.length) {
                const result = await fns[index]({
                    instructions,
                    tokens: this._tokens ? this._tokens : [],
                    walletAddress: this._walletAddress,
                    connection: this._connection,
                });
                if (!_.isNull(result)) {
                    return result;
                }
                else {
                    return await firstNonNull(fns, index + 1);
                }
            }
            else
                return null;
        };
        const result = (await firstNonNull(fns, 0));
        return result;
    }
    async nedParser(instructions) {
        const knownPrograms = protocolsPrograms.concat(solanaPrograms);
        const parsedInstructions = await this.parseProgramInstructions(instructions, knownPrograms);
        const inferenceTransactions = await this.inferTransactionType(parsedInstructions);
        return {
            ...inferenceTransactions,
            instructions: parsedInstructions,
        };
    }
    async parseTransaction(txId, commitment) {
        // console.log('Start parsing transaction %s', txId)
        var _a, _b;
        const transaction = await this._connection.getTransaction(txId, {
            commitment: commitment,
            maxSupportedTransactionVersion: 0,
        });
        if (!transaction)
            return null;
        const parsedInstructions = flattenTransactionResponse(transaction).map((ix) => this._txParser.parseInstruction(ix));
        if (parsedInstructions)
            return {
                ...(await this.nedParser(parsedInstructions)),
                date: transaction.blockTime,
                fee: (_a = transaction.meta) === null || _a === void 0 ? void 0 : _a.fee,
                txId,
                success: _.isNull((_b = transaction.meta) === null || _b === void 0 ? void 0 : _b.err),
                raw: transaction,
            };
        else
            return null;
    }
    async parseInstruction(message, altLoadedAddresses) {
        const parsedInstructions = this._txParser.parseTransactionData(message, altLoadedAddresses);
        return await this.nedParser(parsedInstructions);
    }
    parseLogs(logs) {
        return parseLogsParser(logs);
    }
    parseTransactionDump(txDump) {
        const parsedInstruction = this._txParser.parseTransactionDump(txDump);
        return parsedInstruction;
    }
}
//# sourceMappingURL=index.js.map