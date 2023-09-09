import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { InferenceFnProps, InferenceResult, Swap, SwapTransaction } from "../humanize/types";
import { WSOL_ADDRESS } from "../utils/token";

const jupiterTransactionV4 = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP_V4')

    if (swap.length == 1) {
        const data = swap[0].data as Swap
        const getAccountMint = async (address: string) => {
            return await getAccount(connection, new PublicKey(address))
                .then(result => result.address.toBase58())
                .catch(async (e) => {
                    if (walletAddress) {
                        const deriveAddress = await getAssociatedTokenAddressSync(new PublicKey(WSOL_ADDRESS), new PublicKey(walletAddress))
                        if (deriveAddress.toBase58() == address) return WSOL_ADDRESS
                    } else return undefined
                })
        }

        const fromAccountMint = await getAccountMint(data.from)
        const toAccountMint = await getAccountMint(data.to)

        const tokenFromObject = tokens.find(t => t.address == fromAccountMint)
        const tokenToObject = tokens.find(t => t.address == toAccountMint)

        console.log('tokenFromObject.decimals', data.amountIn, tokenFromObject?.decimals)

        const fromAmount = tokenFromObject ? data.amountIn / Math.pow(10, tokenFromObject.decimals) : data.amountIn
        const toAmount = tokenToObject ? data.amountOut / Math.pow(10, tokenToObject.decimals) : data.amountOut

        console.log('fromAmount', fromAmount)

        const swapData = {
            tokenFrom: {
                ...tokenFromObject,
                amount: fromAmount,
            },
            tokenTo: {
                ...tokenToObject,
                amount: toAmount,
            }
        } as SwapTransaction

        console.log('swapData', swapData)

        return {
            type: 'JUPITER_SWAP_V4',
            data: swapData,
            instructions
        }
    } else return null

}

export default jupiterTransactionV4