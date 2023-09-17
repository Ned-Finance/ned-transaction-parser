"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const cache_1 = require("../cache");
const token_1 = require("../utils/token");
const splTransfer = async (props) => {
    const { instructions, tokens, walletAddress, connection } = props;
    const transferInstruction = instructions.filter(i => i.type == 'SPL_TRANSFER');
    // console.log('Effort on splTransfer', (transferInstruction.length == 1))
    if (transferInstruction.length == 1) {
        const transfer = transferInstruction[0].data;
        const tokenObject = await (async () => {
            if (transfer.tokenMint) {
                const tokenFound = tokens.find(t => t.address == transfer.tokenMint);
                if (tokenFound)
                    return tokenFound;
                else {
                    return await (0, token_1.tokenFromMetaplex)(transfer.tokenMint, connection);
                }
            }
            else {
                if (walletAddress) {
                    //To speed up search next time
                    const tokenFromTo = cache_1.Cache.ref().get(transfer.to);
                    if (tokenFromTo) {
                        return JSON.parse(tokenFromTo);
                    }
                    const tokenFromFrom = cache_1.Cache.ref().get(transfer.from);
                    if (tokenFromFrom) {
                        return JSON.parse(tokenFromFrom);
                    }
                    const found = lodash_1.default.first((await Promise.all(tokens.map(async (t) => {
                        return new Promise(async (resolve) => {
                            const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(t.address), new web3_js_1.PublicKey(walletAddress));
                            if (ata.toBase58() == transfer.to) {
                                cache_1.Cache.ref().set(transfer.to, JSON.stringify(t));
                                return resolve(t);
                            }
                            if (ata.toBase58() == transfer.from) {
                                cache_1.Cache.ref().set(transfer.from, JSON.stringify(t));
                                return resolve(t);
                            }
                            return resolve(null);
                        });
                    }))).filter(t => !lodash_1.default.isNull(t)));
                    return found || null;
                }
                else {
                    return null;
                }
            }
        })();
        // console.log('tokenObject', tokenObject)
        // If this doesn't hace mint is not the transfer tx we expect
        if (tokenObject) {
            const amount = tokenObject ? transfer.amount / Math.pow(10, tokenObject.decimals) : transfer.amount;
            const getAction = () => {
                if (walletAddress) {
                    const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(tokenObject.address), new web3_js_1.PublicKey(walletAddress));
                    if (ata.toBase58() == transfer.from)
                        return 'WALLET_SEND';
                    if (ata.toBase58() == transfer.to)
                        return 'WALLET_RECEIVE';
                    else
                        return 'UNKNOWN';
                }
                else {
                    return 'UNKNOWN';
                }
            };
            return {
                type: 'SPL_TRANSFER',
                data: {
                    ...transfer,
                    ...tokenObject,
                    amount,
                    action: getAction()
                }
            };
        }
        else {
            return null;
        }
    }
    else
        return null;
};
exports.default = splTransfer;
//# sourceMappingURL=splTransfer.js.map