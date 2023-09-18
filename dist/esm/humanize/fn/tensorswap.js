import { match } from "ts-pattern";
import { getMetadataFromAddress, getNftMetadataFromUri } from "../../utils/nft";
const parseList = async (parsed, connection) => {
    const mintAccount = parsed.accounts.find(account => account.name == 'nftMint');
    // console.log('parsed.accounts', parsed.accounts)
    // console.log('mintAccount', mintAccount)
    const getMetadata = async () => {
        if (mintAccount) {
            const metadata = await getMetadataFromAddress(connection, mintAccount.pubkey.toBase58());
            const metadataFromUri = await getNftMetadataFromUri(metadata.data.uri);
            return metadataFromUri;
        }
        else {
            return {};
        }
    };
    const metadata = await getMetadata();
    // console.log('metadata ====>', metadata)
    const args = parsed.args;
    return {
        data: {
            listPrice: Number(args.price),
            marketplace: 'TENSOR',
            nftMint: mintAccount === null || mintAccount === void 0 ? void 0 : mintAccount.pubkey.toBase58(),
            name: metadata.name,
            image: metadata.image,
            rawInstruction: parsed,
        }
    };
};
const defaultHandler = async (parsed, connection) => {
    const args = parsed.args;
    return {
        data: {
            listPrice: 0,
            marketplace: 'TENSOR',
            nftMint: undefined,
            rawInstruction: parsed
        }
    };
};
export default async (parsed, connection) => {
    const getType = () => match(parsed.name)
        .with('list', () => 'LIST_NFT')
        .with('editSingleListing', () => 'LIST_NFT')
        .with('delist', () => 'DELIST_NFT')
        .otherwise(() => 'UNKNOWN');
    const partialTransaction = await match(parsed.name)
        .with('list', async () => await parseList(parsed, connection))
        .with('editSingleListing', async () => await parseList(parsed, connection))
        .otherwise(async () => await defaultHandler(parsed, connection));
    // console.log('Tensor Program:', partialTransaction)
    return {
        data: partialTransaction.data,
        type: getType(),
        relevance: 'PRIMARY'
    };
};
//# sourceMappingURL=tensorswap.js.map