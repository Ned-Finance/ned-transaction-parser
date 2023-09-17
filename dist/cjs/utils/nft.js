"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetadataFromAddress = exports.getNftMetadataFromUri = void 0;
const tslib_1 = require("tslib");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const axios_1 = tslib_1.__importDefault(require("axios"));
const uriFixed = (uri) => {
    const ipfs = uri.indexOf('/ipfs/');
    if (ipfs > -1) {
        const parts = String(uri).split("/");
        const identifier = parts[parts.length - 1];
        return `https://${identifier}.ipfs.nftstorage.link/`.replace(/[^a-zA-Z0-9 \.\:\/\-]/g, "");
    }
    else
        return uri;
};
const getNftMetadataFromUri = async (uri) => {
    // original uri is returning error for cloudflare protection
    try {
        const req = await axios_1.default.get(uriFixed(uri));
        return req.data;
    }
    catch (e) {
        console.log('err on getNftMetadataFromUri', e);
        return {};
    }
};
exports.getNftMetadataFromUri = getNftMetadataFromUri;
const getMetadataFromAddress = async (connection, mint) => {
    const [publicKey] = await web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from("metadata"),
        new web3_js_1.PublicKey(mpl_token_metadata_1.PROGRAM_ADDRESS).toBuffer(),
        new web3_js_1.PublicKey(mint).toBuffer()
    ], new web3_js_1.PublicKey(mpl_token_metadata_1.PROGRAM_ADDRESS));
    console.log('publicKey', publicKey);
    const metadataPDA = await mpl_token_metadata_1.Metadata.fromAccountAddress(connection, publicKey);
    return metadataPDA;
};
exports.getMetadataFromAddress = getMetadataFromAddress;
//# sourceMappingURL=nft.js.map