"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const ts_pattern_1 = require("ts-pattern");
const unknown_1 = require("./unknown");
const parseOrca = async (parsed, connection) => {
    const args = parsed.args;
    const from = lodash_1.default.find(parsed.accounts, (account) => account.name == 'tokenOwnerAccountA').pubkey.toBase58();
    const to = lodash_1.default.find(parsed.accounts, (account) => account.name == 'tokenOwnerAccountB').pubkey.toBase58();
    return {
        data: {
            from,
            to,
            amountIn: Number(args.inAmount),
            amountOut: Number(args.minimumOutAmount),
            protocol: 'JUPITER',
            rawInstruction: parsed
        }
    };
};
const parseSwapRaydium = async (parsed, connection) => {
    const args = parsed.args;
    const from = lodash_1.default.find(parsed.accounts, (account) => account.name == 'userSourceTokenAccount').pubkey.toBase58();
    const to = lodash_1.default.find(parsed.accounts, (account) => account.name == 'userDestinationTokenAccount').pubkey.toBase58();
    return {
        data: {
            from,
            to,
            amountIn: args.inAmount,
            amountOut: args.minimumOutAmount,
            protocol: 'JUPITER',
            rawInstruction: parsed
        }
    };
};
const defaultHandler = async (parsed) => {
    return await (0, unknown_1.humanizeUnknown)(parsed);
};
exports.default = async (parsed, connection) => {
    const [type, partialTransaction] = await (0, ts_pattern_1.match)(parsed.name)
        .with('whirlpoolSwap', async () => new Promise(async (resolve) => resolve(['JUPITER_SWAP_V2', (await parseOrca(parsed, connection))])))
        .with('raydiumSwapV2', async () => new Promise(async (resolve) => resolve(['JUPITER_SWAP_V2', (await parseSwapRaydium(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed))])));
    console.log('Jupiter Program V2:', partialTransaction);
    return {
        data: partialTransaction.data,
        type,
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=jupiterSwapV2.js.map