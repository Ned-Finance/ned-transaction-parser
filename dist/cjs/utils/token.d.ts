import { Connection } from "@solana/web3.js";
import { SolanaParserToken } from "..";
export declare const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";
export declare const tokenFromMetaplex: (tokenMint: string, connection: Connection) => Promise<(SolanaParserToken | null)>;
export declare const getAccountMint: (address: string, walletAddress: string, connection: Connection) => Promise<string | undefined>;
//# sourceMappingURL=token.d.ts.map