import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import _ from "lodash";
import { Cache } from "../cache";
import { InferenceFnProps, InferenceResult, Transfer } from "../humanize/types";
import { tokenFromMetaplex } from "../utils/token";

const splTransfer = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const transferInstruction = instructions.filter(i => i.type == 'SPL_TRANSFER')
    if (transferInstruction.length == 1) {
        const transfer = transferInstruction[0].data as Transfer

        const tokenObject = await (async () => {
            if (transfer.tokenMint) {
                const tokenFound = tokens.find(t => t.address == transfer.tokenMint)
                if (tokenFound) return tokenFound
                else {
                    return await tokenFromMetaplex(transfer.tokenMint!, connection)
                }
            } else {
                if (walletAddress) {
                    //To speed up search next time
                    const tokenFromTo = Cache.ref().get(transfer.to)
                    if (tokenFromTo) {
                        return JSON.parse(tokenFromTo as string)
                    }
                    const tokenFromFrom = Cache.ref().get(transfer.from)
                    if (tokenFromFrom) {
                        return JSON.parse(tokenFromFrom as string)
                    }

                    const found = _.first((await Promise.all(tokens.map(async (t) => {
                        return new Promise(async (resolve,) => {
                            const ata = getAssociatedTokenAddressSync(new PublicKey(t.address), new PublicKey(walletAddress))
                            if (ata.toBase58() == transfer.to) {
                                Cache.ref().set(transfer.to, JSON.stringify(t))
                                return resolve(t)
                            }
                            if (ata.toBase58() == transfer.from) {
                                Cache.ref().set(transfer.from, JSON.stringify(t))
                                return resolve(t)
                            }

                            return resolve(null)

                        })

                    }))).filter(t => !_.isNull(t)))

                    return found || null
                } else {
                    return null
                }

            }
        })()
        // console.log('tokenObject', tokenObject)

        // If this doesn't hace mint is not the transfer tx we expect
        if (tokenObject) {
            const amount = tokenObject ? transfer.amount / Math.pow(10, tokenObject.decimals) : transfer.amount
            const getAction = () => {
                if (walletAddress) {
                    const ata = getAssociatedTokenAddressSync(new PublicKey(tokenObject.address), new PublicKey(walletAddress))
                    if (ata.toBase58() == transfer.from) return 'WALLET_SEND'
                    if (ata.toBase58() == transfer.to) return 'WALLET_RECEIVE'
                    else return 'UNKNOWN'
                } else {
                    return 'UNKNOWN'
                }
            }

            return {
                type: 'SPL_TRANSFER',
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

export default splTransfer