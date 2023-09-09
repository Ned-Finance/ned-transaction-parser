import { Connection } from "@solana/web3.js"
import { SolanaParserToken } from "../parser"

export type ParsedType =
    'LIST_NFT' |
    'DELIST_NFT' |
    'SEND_NFT' |
    'JUPITER_SWAP' |
    'JUPITER_SWAP_V2' |
    'JUPITER_SWAP_V4' |
    'SWAP' |
    'SOL_TRANSFER' |
    'SPL_TRANSFER' |
    'TOKEN_MINT' |
    'COMPUTE_BUDGET' |
    'UNKNOWN'

export type HumanizeMatchResult = [ParsedType, Partial<ReadableParsedInstruction>]

export type NftMarketplaces =
    'TENSOR' |
    'MAGIC_EDEN' |
    'EXCHANGE_ART'

export type Nft = {
    nftMint?: string
    listPrice: number
    marketplace: NftMarketplaces
    name?: string
    image?: string
}

export type Transfer = {
    from: string
    to: string
    amount: number
    tokenMint?: string
}

export type TokenMint = {
    to: string
    authority: string
    tokenMint?: string,
    amount: number
}

export type SwapProtocol =
    'JUPITER' |
    'ORCA'

export type Swap = {
    from: string
    to: string
    authority?: string
    amountIn: number
    amountOut: number
    protocol: SwapProtocol
}

export type Unknown = {
    rawInstruction: any
}

export type PRIMARY = 'PRIMARY'
export type SECONDARY = 'SECONDARY'

export type RELEVANCE = PRIMARY | SECONDARY

type DataInstruction = Nft | Transfer | Swap | TokenMint | Unknown

export type ReadableParsedInstruction = {
    type: ParsedType
    data: DataInstruction
    relevance: RELEVANCE,
}

// Transaction


export type SwapTokenInfo = {
    name: string,
    address: string,
    symbol: string,
    logoURI: string,
    amount: number,
}
export type SwapTransaction = {
    tokenFrom: SwapTokenInfo,
    tokenTo: SwapTokenInfo
}

export type SplTransferTransaction = {
    from: string,
    to: string,
    name: string,
    address: string,
    symbol: string,
    logoURI: string,
    amount: number,
    action: 'WALLET_SEND' | 'WALLET_RECEIVE' | 'UNKNOWN'
}

export type SolTransferTransaction = {
    from: string,
    to: string,
    name: string,
    address: string,
    symbol: string,
    logoURI: string,
    amount: number,
    action: 'WALLET_SEND' | 'WALLET_RECEIVE' | 'UNKNOWN'
}

export type UnknownTransaction = {

}


type DataTransaction =
    SwapTransaction
    | SplTransferTransaction
    | SolTransferTransaction
    | UnknownTransaction


export type ReadableParsedTransaction = {
    type: ParsedType
    data: DataTransaction
    instructions?: ReadableParsedInstruction[]
}


export type InferenceFnProps = {
    instructions: ReadableParsedInstruction[],
    tokens: SolanaParserToken[],
    walletAddress?: string,
    connection: Connection
}

export type InferenceResult = ReadableParsedTransaction | null