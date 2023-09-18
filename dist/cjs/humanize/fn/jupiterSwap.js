"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const ts_pattern_1 = require("ts-pattern");
const unknown_1 = require("./unknown");
const parseSwap = async (parsed, connection) => {
    const args = parsed.args;
    const from = lodash_1.default.find(parsed.accounts, (account) => account.name == 'sourceTokenAccount').pubkey.toBase58();
    const to = lodash_1.default.find(parsed.accounts, (account) => account.name == 'destinationTokenAccount').pubkey.toBase58();
    const authority = lodash_1.default.find(parsed.accounts, (account) => account.name == 'userTransferAuthority').pubkey.toBase58();
    return {
        data: {
            from,
            to,
            amountIn: Number(args.inAmount),
            amountOut: Number(args.quotedOutAmount),
            authority,
            protocol: 'JUPITER',
            rawInstruction: parsed
        }
    };
};
const defaultHandler = async (parsed) => {
    return await (0, unknown_1.humanizeUnknown)(parsed);
};
exports.default = async (parsed, connection) => {
    const getType = () => (0, ts_pattern_1.match)(parsed.name)
        .with('sharedAccountsRoute', () => 'JUPITER_SWAP')
        .otherwise(() => 'UNKNOWN');
    const partialTransaction = await (0, ts_pattern_1.match)(parsed.name)
        .with('sharedAccountsRoute', async () => await parseSwap(parsed, connection))
        .otherwise(async () => await defaultHandler(parsed));
    // console.log('Jupiter Program:', partialTransaction)
    return {
        data: partialTransaction.data,
        type: getType(),
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=jupiterSwap.js.map