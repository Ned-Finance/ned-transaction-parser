/// <reference types="node" />
import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection, Finality, Message, VersionedMessage } from "@solana/web3.js";
import { ReadableParsedTransaction } from "./humanize/types";
export type SolanaParserToken = {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    logoURI: string;
};
export type SolanaParserConfig = {
    connection: Connection;
    walletAddress?: string;
    tokens?: SolanaParserToken[];
};
export default class SolanaParser {
    private _txParser;
    private _connection;
    private _walletAddress?;
    private _tokens?;
    constructor(config: SolanaParserConfig);
    private parseProgramInstructions;
    private parseUnknownInstructions;
    private inferTransactionType;
    private nedParser;
    parseTransaction(txId: string, commitment?: Finality): Promise<ReadableParsedTransaction | null>;
    parseInstruction<T extends Message | VersionedMessage>(message: T): Promise<ReadableParsedTransaction>;
    parseLogs(logs: string[]): import("@debridge-finance/solana-transaction-parser").LogContext[];
    parseTransactionDump(txDump: string | Buffer): ParsedInstruction<Idl, string>[];
}
//# sourceMappingURL=index.d.ts.map