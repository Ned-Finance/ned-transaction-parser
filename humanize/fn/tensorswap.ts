import { Idl } from "@coral-xyz/anchor";
import { ParsedInstruction } from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import { match } from "ts-pattern";
import { getMetadataFromAddress, getNftMetadataFromUri } from "../../utils/nft";
import { ParsedType, ReadableParsedInstruction } from "../types";

const parseList = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {
    const mintAccount = parsed.accounts.find(account => account.name == 'nftMint')
    console.log('parsed.accounts', parsed.accounts)
    console.log('mintAccount', mintAccount)
    const getMetadata = async (): Promise<any> => {
        if (mintAccount) {
            const metadata = await getMetadataFromAddress(connection, mintAccount.pubkey.toBase58())
            const metadataFromUri = await getNftMetadataFromUri(metadata.data.uri)
            return metadataFromUri
        } else {
            return {}
        }
    }

    const metadata = await getMetadata()
    console.log('metadata ====>', metadata)
    const args = parsed.args as any
    return {
        data: {
            listPrice: Number(args.price),
            marketplace: 'TENSOR',
            nftMint: mintAccount?.pubkey.toBase58(),
            name: metadata.name,
            image: metadata.image,
        }
    }

}

const defaultHandler = async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<Partial<ReadableParsedInstruction>> => {

    const args = parsed.args as any
    return {
        data: {
            listPrice: 0,
            marketplace: 'TENSOR',
            nftMint: undefined
        }
    }
}

export default async (parsed: ParsedInstruction<Idl, string>, connection: Connection): Promise<ReadableParsedInstruction> => {

    const getType = (): ParsedType => match(parsed.name)
        .with('list', () => 'LIST_NFT')
        .with('editSingleListing', () => 'LIST_NFT')
        .with('delist', () => 'DELIST_NFT')
        .otherwise(() => 'UNKNOWN') as ParsedType

    const partialTransaction = await match(parsed.name)
        .with('list', async () => await parseList(parsed, connection))
        .with('editSingleListing', async () => await parseList(parsed, connection))
        .otherwise(async () => await defaultHandler(parsed, connection))

    console.log('Tensor Program:', partialTransaction)

    return {
        data: partialTransaction.data!,
        type: getType(),
        relevance: 'PRIMARY'

    }
}