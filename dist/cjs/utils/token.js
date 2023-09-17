"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountMint = exports.tokenFromMetaplex = exports.WSOL_ADDRESS = void 0;
const tslib_1 = require("tslib");
const js_1 = require("@metaplex-foundation/js");
const spl_token_1 = require("@solana/spl-token");
const cross_fetch_1 = tslib_1.__importDefault(require("cross-fetch"));
const cache_1 = require("../cache");
exports.WSOL_ADDRESS = 'So11111111111111111111111111111111111111112';
const tokenFromMetaplex = async (tokenMint, connection) => {
    const key = `token-${tokenMint}`;
    const cache = cache_1.Cache.ref().get(key);
    if (cache) {
        return cache;
    }
    else {
        const metaplex = new js_1.Metaplex(connection);
        const getNftMetadataFromUri = async (uri) => {
            const req = await (0, cross_fetch_1.default)(uri, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.6",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Brave\";v=\"115\", \"Chromium\";v=\"115\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "cross-site",
                    "sec-gpc": "1"
                },
                "body": null,
                "method": "GET",
            });
            return req.json();
        };
        try {
            const token = await metaplex.nfts().findByMint({ mintAddress: new js_1.PublicKey(tokenMint) });
            if (token) {
                const detailsFromUri = await getNftMetadataFromUri(token.uri);
                const tokenResult = {
                    name: token.name,
                    address: token.address.toBase58(),
                    symbol: token.symbol,
                    decimals: token.mint.decimals,
                    logoURI: detailsFromUri.image,
                };
                cache_1.Cache.ref().set(key, tokenResult);
                return tokenResult;
            }
            else {
                return null;
            }
        }
        catch (e) {
            return null;
        }
    }
};
exports.tokenFromMetaplex = tokenFromMetaplex;
const getAccountMint = async (address, walletAddress, connection) => {
    const key = `mint-${address}-${walletAddress}`;
    const cache = cache_1.Cache.ref().get(key);
    if (cache)
        return cache;
    else
        return await (0, spl_token_1.getAccount)(connection, new js_1.PublicKey(address))
            .then(result => {
            const mint = result.mint.toBase58();
            cache_1.Cache.ref().set(key, mint);
            return mint;
        })
            .catch(async (e) => {
            if (walletAddress) {
                const deriveAddress = await (0, spl_token_1.getAssociatedTokenAddressSync)(new js_1.PublicKey(exports.WSOL_ADDRESS), new js_1.PublicKey(walletAddress));
                if (deriveAddress.toBase58() == address) {
                    cache_1.Cache.ref().set(key, exports.WSOL_ADDRESS);
                    return exports.WSOL_ADDRESS;
                }
            }
            else
                return undefined;
        });
};
exports.getAccountMint = getAccountMint;
//# sourceMappingURL=token.js.map