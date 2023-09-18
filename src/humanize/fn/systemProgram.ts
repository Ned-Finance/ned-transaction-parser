import { Idl } from "@coral-xyz/anchor";
import { ParsedAccount, ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { HumanizeMatchResult, ReadableParsedInstruction } from "../types";
import { humanizeUnknown } from "./unknown";


const transfer = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    const args = parsed.args as any
    const from = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'sender')!.pubkey.toBase58()
    const to = _.find(parsed.accounts, (account: ParsedAccount) => account.name == 'receiver')!.pubkey.toBase58()
    const amount = Number(args.lamports)

    return {
        data: {
            from,
            to,
            amount,
            rawInstruction: parsed
        }
    }
}

const defaultHandler = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {
    return await humanizeUnknown(parsed)
}

export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {

    const [type, partialTransaction]: HumanizeMatchResult = await match(parsed.name)
        .with('transfer', async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['SOL_TRANSFER', (await transfer(parsed, connection))])))
        .with('transferChecked', async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['SPL_TRANSFER', (await transfer(parsed, connection))])))
        .otherwise(async () =>
            new Promise<HumanizeMatchResult>(async (resolve,) => resolve(['UNKNOWN', (await defaultHandler(parsed, connection))])))

    // console.log('Token program: ', partialTransaction)

    return {
        data: partialTransaction.data!,
        type: type,
        relevance: "PRIMARY"
    }
}