import { Idl } from "@coral-xyz/anchor";
import { ParsedAccount, ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { HumanizeMatchResult, ReadableParsedInstruction } from "../types";
import { humanizeUnknown } from "./unknown";


const parseOrca = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {
    const args = parsed.args as any
    const from = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'tokenOwnerAccountA')!.pubkey.toBase58()
    const to = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'tokenOwnerAccountB')!.pubkey.toBase58()
    return {
        data: {
            from,
            to,
            amountIn: Number(args.inAmount),
            amountOut: Number(args.minimumOutAmount),
            protocol: 'JUPITER',
            rawInstruction: parsed
        }
    }
}

const parseSwapRaydium = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    const args = parsed.args as any
    const from = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'userSourceTokenAccount')!.pubkey.toBase58()
    const to = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'userDestinationTokenAccount')!.pubkey.toBase58()
    return {
        data: {
            from,
            to,
            amountIn: args.inAmount,
            amountOut: args.minimumOutAmount,
            protocol: 'JUPITER',
            rawInstruction: parsed
        }
    }
}

const defaultHandler = async (parsed: ParsedInstruction<Idl, string>): Promise<Partial<ReadableParsedInstruction>> => {
    return await humanizeUnknown(parsed)
}


export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {

    const [type, partialTransaction]: HumanizeMatchResult = await match(parsed.name)
        .with('whirlpoolSwap', async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['JUPITER_SWAP_V2', (await parseOrca(parsed, connection))])))
        .with('raydiumSwapV2', async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['JUPITER_SWAP_V2', (await parseSwapRaydium(parsed, connection))])))
        .otherwise(async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['UNKNOWN', (await defaultHandler(parsed))])))

    console.log('Jupiter Program V2:', partialTransaction)

    return {
        data: partialTransaction.data!,
        type,
        relevance: 'PRIMARY'

    }
}