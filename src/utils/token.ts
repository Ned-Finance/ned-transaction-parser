import { Metaplex, PublicKey } from "@metaplex-foundation/js"
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token"
import { Connection } from "@solana/web3.js"
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
            const req = await fetch(uri, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.6",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Brave\";v=\"115\", \"Chromium\";v=\"115\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "sec-gpc": "1"
                },
                "body": null,
                "method": "GET",
            });

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