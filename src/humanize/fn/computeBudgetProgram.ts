import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import { ReadableParsedInstruction } from "../types";


const parse = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    return {
        data: {
            rawInstruction: parsed
        }
    }
}

export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {

    const partialTransaction = await parse(parsed, connection)

    console.log('Compute Budget program: ', partialTransaction)

    return {
        data: partialTransaction.data!,
        type: 'COMPUTE_BUDGET',
        relevance: 'SECONDARY'
    }
}