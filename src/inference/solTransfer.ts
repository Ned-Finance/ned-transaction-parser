import { InferenceFnProps, InferenceResult, Transfer } from "../humanize/types";

const solTransfer = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const transferInstruction = instructions.filter(i => i.type == 'SOL_TRANSFER')
    // console.log('Effort on solTransfer', (transferInstruction.length == 1))
    if (transferInstruction.length == 1) {

        const transfer = transferInstruction[0].data as Transfer

        const tokenObject = {
            name: "SOL",
            address: '',
            symbol: "SOL",
            logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
            decimals: 9
        }

        if (tokenObject) {
            const amount = tokenObject ? transfer.amount / Math.pow(10, tokenObject.decimals) : transfer.amount

            const getAction = () => {
                if (walletAddress) {
                    if (walletAddress == transfer.from) return 'WALLET_SEND'
                    if (walletAddress == transfer.to) return 'WALLET_RECEIVE'
                    else return 'UNKNOWN'
                } else {
                    return 'UNKNOWN'
                }
            }

            return {
                type: transferInstruction[0].type,
                data: {
                    ...transfer,
                    ...tokenObject,
                    amount,
                    action: getAction()
                }
            }
        } else {
            return null
        }

    } else return null

}

export default solTransfer