import _ from "lodash";
import { match } from "ts-pattern";
import { humanizeUnknown } from "./unknown";
const transfer = async (parsed, connection) => {
    const args = parsed.args;
    const from = _.find(parsed.accounts, (account) => account.name == 'sender').pubkey.toBase58();
    const to = _.find(parsed.accounts, (account) => account.name == 'receiver').pubkey.toBase58();
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
    return await humanizeUnknown(parsed);
};
export default async (parsed, connection) => {
    const [type, partialTransaction] = await match(parsed.name)
        .with('transfer', async () => new Promise(async (resolve) => resolve(['SOL_TRANSFER', (await transfer(parsed, connection))])))
        .with('transferChecked', async () => new Promise(async (resolve) => resolve(['SPL_TRANSFER', (await transfer(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed, connection))])));
    console.log('Token program: ', partialTransaction);
    return {
        data: partialTransaction.data,
        type: type,
        relevance: "PRIMARY"
    };
};
//# sourceMappingURL=systemProgram.js.map