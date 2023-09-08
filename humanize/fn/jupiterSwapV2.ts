import { Idl } from "@coral-xyz/anchor";
import { ParsedAccount, ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { ParsedType, ReadableParsedInstruction } from "../types";
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
            protocol: 'JUPITER'
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
            protocol: 'JUPITER'
        }
    }
}

const defaultHandler = async (parsed: ParsedInstruction<Idl, string>): Promise<Partial<ReadableParsedInstruction>> => {
    return await humanizeUnknown(parsed)
}


export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {

    const getType = (): ParsedType => match(parsed.name)
        .with('whirlpoolSwap', () => 'JUPITER_SWAP_V2')
        .with('raydiumSwapV2', () => 'JUPITER_SWAP_V2')
        .otherwise(() => 'UNKNOWN') as ParsedType

    const partialTransaction = await match(parsed.name)
        .with('whirlpoolSwap', async () => await parseOrca(parsed, connection))
        .with('raydiumSwapV2', async () => await parseSwapRaydium(parsed, connection))
        .otherwise(async () => await defaultHandler(parsed))

    console.log('Jupiter Program V2:', partialTransaction)

    return {
        ...partialTransaction,
        type: getType(),
        relevance: 'PRIMARY'

    }
}