"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const ts_pattern_1 = require("ts-pattern");
const unknown_1 = require("./unknown");
const transfer = async (parsed, connection) => {
    const args = parsed.args;
    const from = lodash_1.default.find(parsed.accounts, (account) => account.name == 'sender').pubkey.toBase58();
    const to = lodash_1.default.find(parsed.accounts, (account) => account.name == 'receiver').pubkey.toBase58();
    const amount = Number(args.lamports);
    return {
        data: {
            from,
            to,
            amount,
            rawInstruction: parsed
        }
    };
};
const defaultHandler = async (parsed, connection) => {
    return await (0, unknown_1.humanizeUnknown)(parsed);
};
exports.default = async (parsed, connection) => {
    const [type, partialTransaction] = await (0, ts_pattern_1.match)(parsed.name)
        .with('transfer', async () => new Promise(async (resolve) => resolve(['SOL_TRANSFER', (await transfer(parsed, connection))])))
        .with('transferChecked', async () => new Promise(async (resolve) => resolve(['SPL_TRANSFER', (await transfer(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed, connection))])));
    // console.log('Token program: ', partialTransaction)
    return {
        data: partialTransaction.data,
        type: type,
        relevance: "PRIMARY"
    };
};
//# sourceMappingURL=systemProgram.js.map