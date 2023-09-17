"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const token_1 = require("../utils/token");
const splTransferMultiple = async (props) => {
    const { instructions, tokens, walletAddress, connection } = props;
    const transferInstruction = instructions.filter(i => i.type == 'SPL_TRANSFER').map(i => i.data);
    // console.log('transferInstruction', transferInstruction)
    // console.log('Effort on splTransferMultiple', (transferInstruction.length > 0))
    const transfersWithDataP = transferInstruction.map(instruction => {
        return new Promise(async (resolve) => {
            const { from, to, tokenMint } = instruction;
            const getTokenMint = async () => {
                if (!tokenMint) {
                    return await (0, token_1.getAccountMint)(from, walletAddress || "", connection);
                }
                else {
                    return tokenMint;
                }
            };
            const getTokenObject = async () => {
                const tokenMintAddress = await getTokenMint();
                const tokenFound = tokens.find(t => t.address == tokenMintAddress);
                if (tokenFound)
                    return tokenFound;
                else {
                    return await (0, token_1.tokenFromMetaplex)(tokenMintAddress, connection);
                }
            };
            const tokenObject = await getTokenObject();
            if (tokenObject) {
                const getAction = () => {
                    if (walletAddress) {
                        const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(tokenObject.address), new web3_js_1.PublicKey(walletAddress));
                        if (ata.toBase58() == from)
                            return 'WALLET_SEND';
                        if (ata.toBase58() == to)
                            return 'WALLET_RECEIVE';
                        else
                            return 'UNKNOWN';
                    }
                    else {
                        return 'UNKNOWN';
                    }
                };
                const accountFromPromise = (0, spl_token_1.getAccount)(connection, new web3_js_1.PublicKey(from))
                    .then(r => r.owner.toBase58() == walletAddress || "")
                    .catch(async (e) => {
                    if (walletAddress) {
                        const isWSOL = await (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(token_1.WSOL_ADDRESS), new web3_js_1.PublicKey(walletAddress));
                        return isWSOL.toBase58() == walletAddress;
                    }
                    else {
                        return false;
                    }
                });
                const accountToPromise = (0, spl_token_1.getAccount)(connection, new web3_js_1.PublicKey(to))
                    .then(r => r.owner.toBase58() == walletAddress || "")
                    .catch(async (e) => {
                    if (walletAddress) {
                        const isWSOL = await (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(token_1.WSOL_ADDRESS), new web3_js_1.PublicKey(walletAddress));
                        return isWSOL.toBase58() == to;
                    }
                    else {
                        return false;
                    }
                });
                const [accountFrom, accountTo] = await Promise.all([accountFromPromise, accountToPromise]);
                if (accountFrom || accountTo) {
                    const amount = tokenObject ? instruction.amount / Math.pow(10, tokenObject.decimals) : instruction.amount;
                    resolve({
                        type: 'SPL_TRANSFER',
                        data: {
                            ...instruction,
                            ...tokenObject,
                            amount,
                            action: getAction()
                        }
                    });
                }
                else {
                    return resolve(null);
                }
            }
            else {
                return resolve(null);
            }
        });
    });
    const transfersWithData = await Promise.all(transfersWithDataP);
    return lodash_1.default.first(lodash_1.default.filter(transfersWithData, t => !lodash_1.default.isNull(t))) || null;
};
exports.default = splTransferMultiple;
//# sourceMappingURL=splTransferMultiple.js.map