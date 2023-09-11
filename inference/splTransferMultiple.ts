import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import _ from "lodash";
import { InferenceFnProps, InferenceResult, Transfer } from "../humanize/types";
import { WSOL_ADDRESS, getAccountMint, tokenFromMetaplex } from "../utils/token";

const splTransferMultiple = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions, tokens, walletAddress, connection } = props
    const transferInstruction = instructions.filter(i => i.type == 'SPL_TRANSFER').map(i => i.data) as Transfer[]

    const transfersWithDataP = transferInstruction.map(instruction => {
        return new Promise(async (resolve,) => {
            const { from, to, tokenMint } = instruction

            const getTokenMint = async () => {
                if (!tokenMint) {
                    return await getAccount(connection, new PublicKey(from))
                        .then(r => r.mint.toBase58())
                        .catch(async (e) => await getAccountMint(from, walletAddress || "", connection))
                } else {
                    return tokenMint
                }
            }

            const getTokenObject = async () => {
                const tokenMintAddress = await getTokenMint()
                const tokenFound = tokens.find(t => t.address == tokenMintAddress)
                if (tokenFound) return tokenFound
                else {
                    return await tokenFromMetaplex(tokenMintAddress!, connection)
                }
            }

            const tokenObject = await getTokenObject()

            console.log('tokenObject ==>', tokenObject)

            if (tokenObject) {


                const getAction = () => {
                    if (walletAddress) {
                        const ata = getAssociatedTokenAddressSync(new PublicKey(tokenObject.address), new PublicKey(walletAddress))
                        if (ata.toBase58() == from) return 'WALLET_SEND'
                        if (ata.toBase58() == to) return 'WALLET_RECEIVE'
                        else return 'UNKNOWN'
                    } else {
                        return 'UNKNOWN'
                    }
                }

                const accountFromP =
                    getAccount(connection, new PublicKey(from))
                        .then(r => r.owner.toBase58() == walletAddress || "")
                        .catch(async (e) => {
                            if (walletAddress) {
                                const isWSOL = await getAssociatedTokenAddressSync(new PublicKey(WSOL_ADDRESS), new PublicKey(walletAddress))
                                return isWSOL.toBase58() == walletAddress
                            } else {
                                return false
                            }
                        })

                const accountToP =
                    getAccount(connection, new PublicKey(to))
                        .then(r => r.owner.toBase58() == walletAddress || "")
                        .catch(async (e) => {
                            if (walletAddress) {
                                const isWSOL = await getAssociatedTokenAddressSync(new PublicKey(WSOL_ADDRESS), new PublicKey(walletAddress))
                                return isWSOL.toBase58() == to
                            } else {
                                return false
                            }
                        })

                const [accountFrom, accountTo] = await Promise.all([accountFromP, accountToP])

                console.log('accountFrom', from, accountFrom)
                console.log('accountTo', to, accountTo)

                if (accountFrom || accountTo) {
                    const amount = tokenObject ? instruction.amount / Math.pow(10, tokenObject.decimals) : instruction.amount

                    resolve({
                        type: 'SPL_TRANSFER',
                        data: {
                            ...instruction,
                            ...tokenObject,
                            amount,
                            action: getAction()
                        }
                    })
                } else {
                    return resolve(null)
                }

            } else {
                return resolve(null)
            }

        })
    })

    const transfersWithData = await Promise.all(transfersWithDataP) as InferenceResult[]

    return _.first(_.filter(transfersWithData, t => !_.isNull(t))) || null

}

export default splTransferMultiple