import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import { ReadableParsedInstruction } from "../humanize/types";
export type HumanizeFunction = (parsed: ParsedInstruction<Idl, string>, connection: Connection) => Promise<ReadableParsedInstruction>;
export type Program = {
    programId: string;
    name: string;
    humanizeFn: HumanizeFunction;
};
export type ProtocolProgram = {
    idl: Idl;
} & Program;
export type SolanaProgram = Program;
//# sourceMappingURL=types.d.ts.map