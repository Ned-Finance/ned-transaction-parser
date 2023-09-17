import _ from "lodash";
import { match } from "ts-pattern";
import { humanizeUnknown } from "./unknown";
const parseSwap = async (parsed, connection) => {
    const args = parsed.args;
    const from = _.find(parsed.accounts, (account) => account.name == 'sourceTokenAccount').pubkey.toBase58();
    const to = _.find(parsed.accounts, (account) => account.name == 'destinationTokenAccount').pubkey.toBase58();
    const authority = _.find(parsed.accounts, (account) => account.name == 'userTransferAuthority').pubkey.toBase58();
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
    return await humanizeUnknown(parsed);
};
export default async (parsed, connection) => {
    const getType = () => match(parsed.name)
        .with('sharedAccountsRoute', () => 'JUPITER_SWAP')
        .otherwise(() => 'UNKNOWN');
    const partialTransaction = await match(parsed.name)
        .with('sharedAccountsRoute', async () => await parseSwap(parsed, connection))
        .otherwise(async () => await defaultHandler(parsed));
    console.log('Jupiter Program:', partialTransaction);
    return {
        data: partialTransaction.data,
        type: getType(),
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=jupiterSwap.js.map