import _ from "lodash";
import { InferenceFnProps, InferenceResult, Transfer } from "../humanize/types";

const jupiterTransaction = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP_V4')
    console.log('swap --->', swap)
    if (swap.length) {
        const firstTransfer = _.first(instructions.filter(i => i.type == 'SPL_TRANSFER'))!.data as Transfer
        const lastTransfer = _.last(instructions.filter(i => i.type == 'SPL_TRANSFER'))!.data as Transfer

        const tokenFromObject = tokens.find(t => t.address == firstTransfer.tokenMint)
        const tokenToObject = tokens.find(t => t.address == lastTransfer.tokenMint)

        const fromAmount = tokenFromObject ? firstTransfer.amount / Math.pow(10, tokenFromObject.decimals) : firstTransfer.amount
        const toAmount = tokenToObject ? lastTransfer.amount / Math.pow(10, tokenToObject.decimals) : lastTransfer.amount

        return {
            type: 'JUPITER_SWAP',
            data: {
                tokenFrom: {
                    ...tokenFromObject,
                    amount: fromAmount,
                },
                tokenTo: {
                    ...tokenToObject,
                    amount: toAmount,
                }
            },
            instructions
        }
    } else return null

}

export default jupiterTransaction