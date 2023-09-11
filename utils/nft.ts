import { Metadata, PROGRAM_ADDRESS } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, PublicKey } from "@solana/web3.js";
import axios from "axios";

const uriFixed = (uri: string): string => {
    const ipfs = uri.indexOf('/ipfs/')
    if (ipfs > -1) {
        const parts = String(uri).split("/")
        const identifier = parts[parts.length - 1]
        return `https://${identifier}.ipfs.nftstorage.link/`.replace(/[^a-zA-Z0-9 \.\:\/\-]/g, "")

    } else return uri
}

export const getNftMetadataFromUri = async (uri: string) => {

    // original uri is returning error for cloudflare protection

    try {
        const req = await axios.get(uriFixed(uri));
        return req.data

    } catch (e) {
        console.log('err on getNftMetadataFromUri', e)
        return {}
    }
}

export const getMetadataFromAddress = async (connection: Connection, mint: string) => {

    const [publicKey] = await PublicKey.findProgramAddressSync(
        [
            Buffer.from("metadata"),
            new PublicKey(PROGRAM_ADDRESS).toBuffer(),
            new PublicKey(mint).toBuffer()
        ],
        new PublicKey(PROGRAM_ADDRESS)
    );

    console.log('publicKey', publicKey)

    const metadataPDA = await Metadata.fromAccountAddress(
        connection, publicKey)

    return metadataPDA

}