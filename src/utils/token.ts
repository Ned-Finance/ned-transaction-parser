import { Metaplex, PublicKey } from "@metaplex-foundation/js"
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { Connection } from "@solana/web3.js"
import fetch from "cross-fetch"
import { SolanaParserToken } from ".."
import { Cache } from "../cache"

export const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112'

export const tokenFromMetaplex = async (tokenMint: string, connection: Connection): Promise<(SolanaParserToken | null)> => {

    const key = `token-${tokenMint}`
    const cache = Cache.ref().get<SolanaParserToken>(key)
    if (cache) {
        return cache
    } else {
        const metaplex = new Metaplex(connection)

        const getNftMetadataFromUri = async (uri: string) => {
            const req = await fetch(uri.replace(/[^a-zA-Z0-9 \.\:\/\-]/g, ""));

            return req.json()
        }


        try {
            const token = await metaplex.nfts().findByMint(
                { mintAddress: new PublicKey(tokenMint) })
            if (token) {
                const detailsFromUri = await getNftMetadataFromUri(token.uri)
                const tokenResult = {
                    name: token.name,
                    address: token.address.toBase58(),
                    symbol: token.symbol,
                    decimals: token.mint.decimals,
                    logoURI: detailsFromUri.image,
                }
                Cache.ref().set(key, tokenResult)
                return tokenResult
            } else {
                return null
            }
        }
        catch (e) {
            return null
        }
    }


}

export const getAccountMint = async (address: string, walletAddress: string, connection: Connection) => {
    const key = `mint-${address}-${walletAddress}`
    const cache = Cache.ref().get<string>(key)
    if (cache)
        return cache
    else return await getAccount(connection, new PublicKey(address))
        .then(result => {
            const mint = result.mint.toBase58()
            Cache.ref().set(key, mint)
            return mint
        })
        .catch(async (e) => {
            if (walletAddress) {
                const deriveAddress = await getAssociatedTokenAddressSync(new PublicKey(WSOL_ADDRESS), new PublicKey(walletAddress))
                if (deriveAddress.toBase58() == address) {
                    Cache.ref().set(key, WSOL_ADDRESS)
                    return WSOL_ADDRESS
                }
            } else return undefined
        })
}