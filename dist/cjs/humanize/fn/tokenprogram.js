"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const ts_pattern_1 = require("ts-pattern");
const unknown_1 = require("./unknown");
const transfer = async (parsed, connection) => {
    var _a, _b;
    const args = parsed.args;
    const from = lodash_1.default.find(parsed.accounts, (account) => account.name == 'source').pubkey.toBase58();
    const to = lodash_1.default.find(parsed.accounts, (account) => account.name == 'destination').pubkey.toBase58();
    const tokenMint = (_a = lodash_1.default.find(parsed.accounts, (account) => account.name == 'tokenMint')) === null || _a === void 0 ? void 0 : _a.pubkey.toBase58();
    const owner = (_b = lodash_1.default.find(parsed.accounts, (account) => account.name == 'owner')) === null || _b === void 0 ? void 0 : _b.pubkey.toBase58();
    const amount = Number(args.amount);
    return {
        data: {
            from,
            to,
            amount,
            owner,
            tokenMint,
            rawInstruction: parsed
        }
    };
};
const minTo = async (parsed, connection) => {
    var _a;
    const args = parsed.args;
    const authority = lodash_1.default.find(parsed.accounts, (account) => account.name == 'authority').pubkey.toBase58();
    const to = lodash_1.default.find(parsed.accounts, (account) => account.name == 'mintTo').pubkey.toBase58();
    const tokenMint = (_a = lodash_1.default.find(parsed.accounts, (account) => account.name == 'tokenMint')) === null || _a === void 0 ? void 0 : _a.pubkey.toBase58();
    const amount = Number(args.amount);
    return {
        data: {
            authority,
            to,
            amount,
            tokenMint,
            rawInstruction: parsed
        }
    };
};
const defaultHandler = async (parsed, connection) => {
    return await (0, unknown_1.humanizeUnknown)(parsed);
};
exports.default = async (parsed, connection) => {
    const [type, partialTransaction] = await (0, ts_pattern_1.match)(parsed.name)
        .with('transfer', async () => new Promise(async (resolve) => resolve(['SPL_TRANSFER', (await transfer(parsed, connection))])))
        .with('transferChecked', async () => new Promise(async (resolve) => resolve(['SPL_TRANSFER', (await transfer(parsed, connection))])))
        .with('mintTo', async () => new Promise(async (resolve) => resolve(['TOKEN_MINT', (await minTo(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed, connection))])));
    // console.log('Token program: ', partialTransaction)
    return {
        data: partialTransaction.data,
        type,
        relevance: "PRIMARY"
    };
};
//# sourceMappingURL=tokenprogram.js.map