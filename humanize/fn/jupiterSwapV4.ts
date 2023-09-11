import { Idl } from "@coral-xyz/anchor";
import { ParsedAccount, ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { HumanizeMatchResult, ReadableParsedInstruction } from "../types";
import { humanizeUnknown } from "./unknown";

const parseSwapRaydium = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    const args = parsed.args as any
    const from = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'inputTokenAccount')!.pubkey.toBase58()
    const to = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'outputTokenAccount')!.pubkey.toBase58()
    const slippage = (1 + (parseInt(args.inAmountWithSlippage.slippageBps) / 10000))
    const amountIn = Number(args.inAmountWithSlippage.amount) * (slippage > 0 ? slippage : 1)
    return {
        data: {
            from,
            to,
            amountIn: amountIn,
            amountOut: Number(args.outAmount),
            protocol: 'JUPITER'
        },
    }
}

const route = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    const args = parsed.args as any
    const from = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'Remaining 5')!.pubkey.toBase58()
    const to = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'destinationTokenAccount')!.pubkey.toBase58()
    const slippage = (1 + (parseInt(args.slippageBps) / 10000))
    const amountIn = Number(args.inAmount) * (slippage > 0 ? slippage : 1)
    return {
        data: {
            from,
            to,
            amountIn: amountIn,
            amountOut: Number(args.outAmount),
            protocol: 'JUPITER'
        },
    }
}

const defaultHandler = async (parsed: ParsedInstruction<Idl, string>): Promise<Partial<ReadableParsedInstruction>> => {
    return await humanizeUnknown(parsed)
}


export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {
    const [type, partialTransaction]: HumanizeMatchResult = await match(parsed.name)
        .with('raydiumClmmSwapExactOutput', async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['JUPITER_SWAP_V4', (await parseSwapRaydium(parsed, connection))])))
        .with('route', async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['JUPITER_SWAP_V4', (await route(parsed, connection))])))
        .otherwise(async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['UNKNOWN', (await defaultHandler(parsed))])))

    console.log('Jupiter Program V4:', partialTransaction)

    return {
        data: partialTransaction.data!,
        type: type,
        relevance: 'PRIMARY'

    }
}