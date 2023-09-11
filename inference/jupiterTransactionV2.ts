import _ from "lodash";
import { InferenceFnProps, InferenceResult, Transfer } from "../humanize/types";
import { getAccountMint } from "../utils/token";

const jupiterTransactionV2 = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP_V2')
    console.log('Effort on jupiterTransactionV2', (swap.length == 1))
    if (swap.length == 1) {
        const firstTransfer = _.first(instructions.filter(i => i.type == 'SPL_TRANSFER'))!.data as Transfer
        const lastTransfer = _.last(instructions.filter(i => i.type == 'SPL_TRANSFER'))!.data as Transfer


        const accountFrom =
            await getAccountMint(firstTransfer.from, walletAddress || "", connection)

        const accountTo =
            await getAccountMint(lastTransfer.to, walletAddress || "", connection)

        const tokenFromObject = tokens.find(t => t.address == accountFrom)
        const tokenToObject = tokens.find(t => t.address == accountTo)

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
            }
        }
    } else return null

}

export default jupiterTransactionV2