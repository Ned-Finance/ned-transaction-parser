import _ from "lodash";
import { match } from "ts-pattern";
import { humanizeUnknown } from "./unknown";
const parseOrca = async (parsed, connection) => {
    const args = parsed.args;
    const from = _.find(parsed.accounts, (account) => account.name == 'tokenOwnerAccountA').pubkey.toBase58();
    const to = _.find(parsed.accounts, (account) => account.name == 'tokenOwnerAccountB').pubkey.toBase58();
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
    return await humanizeUnknown(parsed);
};
export default async (parsed, connection) => {
    const [type, partialTransaction] = await match(parsed.name)
        .with('swap', async () => new Promise(async (resolve) => resolve(['SWAP_ORCA', (await parseOrca(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed))])));
    console.log('Jupiter Program V4:', partialTransaction);
    return {
        data: partialTransaction.data,
        type: type,
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=orcaWhirpool.js.map