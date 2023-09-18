import _ from "lodash";
import { match } from "ts-pattern";
import { humanizeUnknown } from "./unknown";
const transfer = async (parsed, connection) => {
    var _a, _b;
    const args = parsed.args;
    const from = _.find(parsed.accounts, (account) => account.name == 'source').pubkey.toBase58();
    const to = _.find(parsed.accounts, (account) => account.name == 'destination').pubkey.toBase58();
    const tokenMint = (_a = _.find(parsed.accounts, (account) => account.name == 'tokenMint')) === null || _a === void 0 ? void 0 : _a.pubkey.toBase58();
    const owner = (_b = _.find(parsed.accounts, (account) => account.name == 'owner')) === null || _b === void 0 ? void 0 : _b.pubkey.toBase58();
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
    const authority = _.find(parsed.accounts, (account) => account.name == 'authority').pubkey.toBase58();
    const to = _.find(parsed.accounts, (account) => account.name == 'mintTo').pubkey.toBase58();
    const tokenMint = (_a = _.find(parsed.accounts, (account) => account.name == 'tokenMint')) === null || _a === void 0 ? void 0 : _a.pubkey.toBase58();
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
    return await humanizeUnknown(parsed);
};
export default async (parsed, connection) => {
    const [type, partialTransaction] = await match(parsed.name)
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