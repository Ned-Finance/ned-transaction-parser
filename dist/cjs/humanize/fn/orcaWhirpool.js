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
            amountIn: args.amountSpecifiedIsInput ? Number(args.amount) : 0,
            amountOut: 0,
            protocol: 'ORCA',
            rawInstruction: parsed
        }
    };
};
const defaultHandler = async (parsed) => {
    return await (0, unknown_1.humanizeUnknown)(parsed);
};
exports.default = async (parsed, connection) => {
    const [type, partialTransaction] = await (0, ts_pattern_1.match)(parsed.name)
        .with('swap', async () => new Promise(async (resolve) => resolve(['SWAP_ORCA', (await parseOrca(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed))])));
    // console.log('Jupiter Program V4:', partialTransaction)
    return {
        data: partialTransaction.data,
        type: type,
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=orcaWhirpool.js.map