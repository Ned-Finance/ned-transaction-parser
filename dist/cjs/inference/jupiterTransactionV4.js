"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const token_1 = require("../utils/token");
const jupiterTransactionV4 = async (props) => {
    const { instructions, tokens, walletAddress, connection } = props;
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP_V4');
    console.log('Effort on jupiterTransactionV4', (swap.length == 1));
    if (swap.length == 1) {
        const transfers = instructions.filter(i => {
            const isSPLTransfer = i.type == 'SPL_TRANSFER';
            const isSOLTransfer = i.type == 'SOL_TRANSFER' && i.data.from == walletAddress;
            return isSPLTransfer || isSOLTransfer;
        });
        console.log('transfers', transfers);
        const ownerTransferIdx = lodash_1.default.findIndex(transfers.filter(i => {
            return i.data.owner == walletAddress || i.data.from == walletAddress;
        }));
        const transferToOwnerIdx = (await Promise.all(transfers.map((i, index) => {
            if (index != ownerTransferIdx) {
                return new Promise(async (resolve) => {
                    const to = i.data.to;
                    const toForOwner = await (0, spl_token_1.getAccount)(connection, new web3_js_1.PublicKey(to))
                        .then(account => account.owner.toBase58() == walletAddress)
                        .catch(e => false);
                    if (!toForOwner) {
                        if (walletAddress) {
                            const wSolAddress = (0, spl_token_1.getAssociatedTokenAddressSync)(new web3_js_1.PublicKey(token_1.WSOL_ADDRESS), new web3_js_1.PublicKey(walletAddress));
                            resolve(wSolAddress.toBase58() == to);
                        }
                        else
                            resolve(false);
                    }
                    else
                        resolve(toForOwner);
                });
            }
            else
                return Promise.resolve(false);
        }))).findIndex(r => r === true);
        const fromOwnerInstruction = ownerTransferIdx > -1 ? transfers[ownerTransferIdx] : null;
        const toOwnerTransferInstruction = transferToOwnerIdx > -1 ? transfers[transferToOwnerIdx] : null;
        const fromOwnerTransferData = fromOwnerInstruction ? fromOwnerInstruction.data : null;
        const toOwnerTransferData = toOwnerTransferInstruction ? toOwnerTransferInstruction.data : null;
        const accountFrom = fromOwnerTransferData ? (await (0, token_1.getAccountMint)(fromOwnerTransferData.from, walletAddress || "", connection)) : '';
        const accountTo = toOwnerTransferData ? await (0, token_1.getAccountMint)(toOwnerTransferData.to, walletAddress || "", connection) : '';
        const tokenFromObject = tokens.find(t => t.address == accountFrom);
        const tokenToObject = tokens.find(t => t.address == accountTo);
        const fromAmount = () => {
            if (fromOwnerTransferData) {
                if (tokenFromObject) {
                    return fromOwnerTransferData.amount / Math.pow(10, tokenFromObject.decimals);
                }
                else {
                    if (fromOwnerInstruction.type == 'SOL_TRANSFER')
                        return fromOwnerTransferData.amount / Math.pow(10, 9);
                    else
                        return fromOwnerTransferData.amount;
                }
            }
            else
                return 0;
        };
        const toAmount = () => {
            if (toOwnerTransferData) {
                if (tokenToObject) {
                    return toOwnerTransferData.amount / Math.pow(10, tokenToObject.decimals);
                }
                else {
                    if (toOwnerTransferInstruction.type == 'SOL_TRANSFER')
                        return toOwnerTransferData.amount / Math.pow(10, 9);
                    else
                        return toOwnerTransferData.amount;
                }
            }
            else
                return 0;
        };
        const swapData = {
            tokenFrom: {
                ...tokenFromObject,
                amount: fromAmount(),
            },
            tokenTo: {
                ...tokenToObject,
                amount: toAmount(),
            }
        };
        return {
            type: 'JUPITER_SWAP_V4',
            data: swapData
        };
    }
    else
        return null;
};
exports.default = jupiterTransactionV4;
//# sourceMappingURL=jupiterTransactionV4.js.map