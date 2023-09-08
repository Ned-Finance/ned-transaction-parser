import { Idl } from "@coral-xyz/anchor"
import { ParsedInstruction } from "@debridge-finance/solana-transaction-parser"
import { ReadableParsedInstruction } from "../types"

export const humanizeUnknown = async (parsed: ParsedInstruction<Idl, string>): Promise<Partial<ReadableParsedInstruction>> => {
    return {
        data: {
            rawInstruction: parsed
        }
    }
}