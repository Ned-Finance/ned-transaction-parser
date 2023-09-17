"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const solana_transaction_parser_1 = require("@debridge-finance/solana-transaction-parser");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const unknown_1 = require("./humanize/fn/unknown");
const jupiterTransaction_1 = tslib_1.__importDefault(require("./inference/jupiterTransaction"));
const jupiterTransactionV2_1 = tslib_1.__importDefault(require("./inference/jupiterTransactionV2"));
const jupiterTransactionV4_1 = tslib_1.__importDefault(require("./inference/jupiterTransactionV4"));
const solTransfer_1 = tslib_1.__importDefault(require("./inference/solTransfer"));
const splTransfer_1 = tslib_1.__importDefault(require("./inference/splTransfer"));
const splTransferMultiple_1 = tslib_1.__importDefault(require("./inference/splTransferMultiple"));
const unknown_2 = tslib_1.__importDefault(require("./inference/unknown"));
const programs_1 = tslib_1.__importDefault(require("./protocols/programs"));
const solana_1 = tslib_1.__importDefault(require("./protocols/solana"));
class SolanaParser {
    constructor(config) {
        this._connection = config.connection;
        this._walletAddress = config.walletAddress;
        this._tokens = config.tokens;
        this._txParser = new solana_transaction_parser_1.SolanaParser(programs_1.default);
    }
    async parseProgramInstructions(instructions, programs) {
        const programsFound = instructions.map(instruction => programs.find(program => {
            return instruction.programId.toBase58() == program.programId;
        })).filter(program => !lodash_1.default.isUndefined(program));
        const parsed = instructions.map((instruction) => {
            const program = programsFound.find(p => p.programId == instruction.programId.toBase58());
            if (program)
                return program.humanizeFn(instruction, this._connection);
            else
                return this.parseUnknownInstructions(instruction);
        });
        return (await Promise.all(parsed)).filter(p => !lodash_1.default.isUndefined(p));
    }
    async parseUnknownInstructions(instruction) {
        return new Promise(async (resolve) => {
            const parsed = await (0, unknown_1.humanizeUnknown)(instruction);
            resolve({
                data: parsed.data,
                type: 'UNKNOWN',
                relevance: 'SECONDARY'
            });
        });
        // }))
    }
    async inferTransactionType(instructions) {
        console.log('Starting inference...');
        console.log(instructions);
        const fns = [
            jupiterTransaction_1.default,
            jupiterTransactionV2_1.default,
            jupiterTransactionV4_1.default,
            splTransfer_1.default,
            solTransfer_1.default,
            splTransferMultiple_1.default,
            unknown_2.default
        ];
        const firstNonNull = async (fns, index) => {
            if (index < fns.length) {
                const result = await fns[index]({
                    instructions,
                    tokens: this._tokens ? this._tokens : [],
                    walletAddress: this._walletAddress,
                    connection: this._connection
                });
                if (!lodash_1.default.isNull(result)) {
                    return result;
                }
                else {
                    return await firstNonNull(fns, index + 1);
                }
            }
            else
                return null;
        };
        const result = await firstNonNull(fns, 0);
        return result;
    }
    async nedParser(instructions) {
        const knownPrograms = programs_1.default.concat(solana_1.default);
        const parsedInstructions = await this.parseProgramInstructions(instructions, knownPrograms);
        const inferenceTransactions = await this.inferTransactionType(parsedInstructions);
        return {
            ...inferenceTransactions,
            instructions: parsedInstructions
        };
    }
    async parseTransaction(txId, commitment) {
        var _a, _b;
        console.log('Start parsing transaction %s', txId);
        const transaction = await this._connection.getTransaction(txId, { commitment: commitment, maxSupportedTransactionVersion: 0 });
        if (!transaction)
            return null;
        const parsedInstructions = (0, solana_transaction_parser_1.flattenTransactionResponse)(transaction).map((ix) => this._txParser.parseInstruction(ix));
        if (parsedInstructions)
            return {
                ...(await this.nedParser(parsedInstructions)),
                date: transaction.blockTime,
                fee: (_a = transaction.meta) === null || _a === void 0 ? void 0 : _a.fee,
                txId,
                success: lodash_1.default.isNull((_b = transaction.meta) === null || _b === void 0 ? void 0 : _b.err),
                raw: transaction
            };
        else
            return null;
    }
    async parseInstruction(message) {
        const parsedInstructions = this._txParser.parseTransactionData(message);
        return await this.nedParser(parsedInstructions);
    }
    parseLogs(logs) {
        return (0, solana_transaction_parser_1.parseLogs)(logs);
    }
    parseTransactionDump(txDump) {
        const parsedInstruction = this._txParser.parseTransactionDump(txDump);
        return parsedInstruction;
    }
}
exports.default = SolanaParser;
//# sourceMappingURL=index.js.map