import { getAccount } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { InferenceFnProps, InferenceResult, Swap, SwapTransaction } from "../humanize/types";
import { getAccountMint } from "../utils/token";

const jupiterTransactionV4 = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP_V4')

    if (swap.length == 1) {
        const data = swap[0].data as Swap

        const accountFrom =
            await getAccount(connection, new PublicKey(data.from))
                .then(r => r.mint.toBase58())
                .catch(async (e) => await getAccountMint(data.from, walletAddress || "", connection))

        const accountTo =
            await getAccount(connection, new PublicKey(data.to))
                .then(r => r.mint.toBase58())
                .catch(async (e) => await getAccountMint(data.to, walletAddress || "", connection))

        const tokenFromObject = tokens.find(t => t.address == accountFrom)
        const tokenToObject = tokens.find(t => t.address == accountTo)

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