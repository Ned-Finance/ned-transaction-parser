import _ from "lodash";
import { match } from "ts-pattern";
import { humanizeUnknown } from "./unknown";
const parseSwapRaydium = async (parsed, connection) => {
    const args = parsed.args;
    const from = _.find(parsed.accounts, (account) => account.name == 'inputTokenAccount').pubkey.toBase58();
    const to = _.find(parsed.accounts, (account) => account.name == 'outputTokenAccount').pubkey.toBase58();
    const slippage = (1 + (parseInt(args.inAmountWithSlippage.slippageBps) / 10000));
    const amountIn = Number(args.inAmountWithSlippage.amount) * (slippage > 0 ? slippage : 1);
    return {
        data: {
            from,
            to,
            amountIn: amountIn,
            amountOut: Number(args.outAmount),
            protocol: 'JUPITER',
            rawInstruction: parsed
        },
    };
};
const route = async (parsed, connection) => {
    var _a, _b, _c, _d;
    const args = parsed.args;
    // console.log('args', args)
    // console.log('parsed.accounts', parsed.accounts)
    const from = (_b = (_a = _.find(parsed.accounts, (account) => account.name == 'Remaining 15')) === null || _a === void 0 ? void 0 : _a.pubkey.toBase58()) !== null && _b !== void 0 ? _b : '';
    const to = (_d = (_c = _.find(parsed.accounts, (account) => account.name == 'destinationTokenAccount')) === null || _c === void 0 ? void 0 : _c.pubkey.toBase58()) !== null && _d !== void 0 ? _d : '';
    const slippage = (1 + (parseInt(args.slippageBps) / 10000));
    const amountIn = Number(args.inAmount) * (slippage > 0 ? slippage : 1);
    return {
        data: {
            from,
            to,
            amountIn: amountIn,
            amountOut: Number(args.quotedOutAmount),
            protocol: 'JUPITER',
            rawInstruction: parsed
        },
    };
};
const defaultHandler = async (parsed) => {
    return await humanizeUnknown(parsed);
};
export default async (parsed, connection) => {
    const [type, partialTransaction] = await match(parsed.name)
        .with('raydiumClmmSwapExactOutput', async () => new Promise(async (resolve) => resolve(['JUPITER_SWAP_V4', (await parseSwapRaydium(parsed, connection))])))
        .with('route', async () => new Promise(async (resolve) => resolve(['JUPITER_SWAP_V4', (await route(parsed, connection))])))
        .otherwise(async () => new Promise(async (resolve) => resolve(['UNKNOWN', (await defaultHandler(parsed))])));
    console.log('Jupiter Program V4:', partialTransaction);
    return {
        data: partialTransaction.data,
        type: type,
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=jupiterSwapV4.js.map