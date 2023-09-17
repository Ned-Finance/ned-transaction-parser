import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection, VersionedTransactionResponse } from "@solana/web3.js";
import { SolanaParserToken } from "..";
export type ParsedType = 'LIST_NFT' | 'DELIST_NFT' | 'SEND_NFT' | 'JUPITER_SWAP' | 'JUPITER_SWAP_V2' | 'JUPITER_SWAP_V3' | 'JUPITER_SWAP_V4' | 'SWAP' | 'SWAP_ORCA' | 'SOL_TRANSFER' | 'SPL_TRANSFER' | 'TOKEN_MINT' | 'COMPUTE_BUDGET' | 'UNKNOWN';
export type HumanizeMatchResult = [ParsedType, Partial<ReadableParsedInstruction>];
export type NftMarketplaces = 'TENSOR' | 'MAGIC_EDEN' | 'EXCHANGE_ART';
export type RawInstruction = {
    rawInstruction: ParsedInstruction<Idl, string>;
};
export type Nft = {
    nftMint?: string;
    listPrice: number;
    marketplace: NftMarketplaces;
    name?: string;
    image?: string;
} & RawInstruction;
export type Transfer = {
    from: string;
    to: string;
    amount: number;
    tokenMint?: string;
    owner?: string;
} & RawInstruction;
export type TokenMint = {
    to: string;
    authority: string;
    tokenMint?: string;
    amount: number;
} & RawInstruction;
export type SwapProtocol = 'JUPITER' | 'ORCA';
export type Swap = {
    from: string;
    to: string;
    authority?: string;
    amountIn: number;
    amountOut: number;
    protocol: SwapProtocol;
} & RawInstruction;
export type Unknown = {} & RawInstruction;
export type PRIMARY = 'PRIMARY';
export type SECONDARY = 'SECONDARY';
export type RELEVANCE = PRIMARY | SECONDARY;
type DataInstruction = Nft | Transfer | Swap | TokenMint | Unknown;
export type ReadableParsedInstruction = {
    type: ParsedType;
    data: DataInstruction;
    relevance: RELEVANCE;
};
export type SwapTokenInfo = {
    name: string;
    address: string;
    symbol: string;
    logoURI: string;
    amount: number;
};
export type SwapTransaction = {
    tokenFrom: SwapTokenInfo;
    tokenTo: SwapTokenInfo;
};
export type SplTransferTransaction = {
    from: string;
    to: string;
    name: string;
    address: string;
    symbol: string;
    logoURI: string;
    amount: number;
    action: 'WALLET_SEND' | 'WALLET_RECEIVE' | 'UNKNOWN';
};
export type SolTransferTransaction = {
    from: string;
    to: string;
    name: string;
    address: string;
    symbol: string;
    logoURI: string;
    amount: number;
    action: 'WALLET_SEND' | 'WALLET_RECEIVE' | 'UNKNOWN';
};
export type UnknownTransaction = {};
type DataTransaction = SwapTransaction | SplTransferTransaction | SolTransferTransaction | UnknownTransaction;
export type ReadableParsedTransaction = {
    type: ParsedType;
    data: DataTransaction;
    instructions?: ReadableParsedInstruction[];
    date?: number | null;
    fee?: number;
    txId?: string;
    success?: boolean;
    raw?: VersionedTransactionResponse;
};
export type InferenceFnProps = {
    instructions: ReadableParsedInstruction[];
    tokens: SolanaParserToken[];
    walletAddress?: string;
    connection: Connection;
};
export type InferenceSucess = {
    type: ParsedType;
    data: DataTransaction;
};
export type InferenceResult = InferenceSucess | null;
export {};
//# sourceMappingURL=types.d.ts.map