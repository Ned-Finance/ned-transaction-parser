import { Idl } from "@coral-xyz/anchor";
import { ParsedAccount, ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { ParsedType, ReadableParsedInstruction } from "../types";
import { humanizeUnknown } from "./unknown";


const transfer = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    const args = parsed.args as any
    console.log('parsed.accounts', parsed.accounts)
    const from = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'sender')!.pubkey.toBase58()
    const to = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'receiver')!.pubkey.toBase58()
    const amount = Number(args.lamports)

    return {
        data: {
            from,
            to,
            amount
        }
    }
}

const defaultHandler = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {
    return await humanizeUnknown(parsed)
}

export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {

    const getType = (): ParsedType => match(parsed.name)
        .with('transfer', () => 'SOL_TRANSFER')
        .with('transferChecked', () => 'SOL_TRANSFER')
        .otherwise(() => 'UNKNOWN') as ParsedType

    const partialTransaction = await match(parsed.name)
        .with('transfer', async () => await transfer(parsed, connection))
        .with('transferChecked', async () => await transfer(parsed, connection))
        .otherwise(async () => await defaultHandler(parsed, connection))

    console.log('Token program: ', partialTransaction)

    return {
        ...partialTransaction,
        type: getType(),
        relevance: "PRIMARY"

    }
}