"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const token_1 = require("../utils/token");
const jupiterTransactionV2 = async (props) => {
    const { instructions, tokens, walletAddress, connection } = props;
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP_V2');
    // console.log('Effort on jupiterTransactionV2', (swap.length == 1))
    if (swap.length == 1) {
        const firstTransfer = lodash_1.default.first(instructions.filter(i => i.type == 'SPL_TRANSFER')).data;
        const lastTransfer = lodash_1.default.last(instructions.filter(i => i.type == 'SPL_TRANSFER')).data;
        const accountFrom = await (0, token_1.getAccountMint)(firstTransfer.from, walletAddress || "", connection);
        const accountTo = await (0, token_1.getAccountMint)(lastTransfer.to, walletAddress || "", connection);
        const tokenFromObject = tokens.find(t => t.address == accountFrom);
        const tokenToObject = tokens.find(t => t.address == accountTo);
        const fromAmount = tokenFromObject ? firstTransfer.amount / Math.pow(10, tokenFromObject.decimals) : firstTransfer.amount;
        const toAmount = tokenToObject ? lastTransfer.amount / Math.pow(10, tokenToObject.decimals) : lastTransfer.amount;
        return {
            type: 'JUPITER_SWAP',
            data: {
                tokenFrom: {
                    ...tokenFromObject,
                    amount: fromAmount,
                },
                tokenTo: {
                    ...tokenToObject,
                    amount: toAmount,
                }
            }
        };
    }
    else
        return null;
};
exports.default = jupiterTransactionV2;
//# sourceMappingURL=jupiterTransactionV2.js.map