"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const jupiterTransaction = async (props) => {
    const { instructions, tokens, walletAddress, connection } = props;
    const swap = instructions.filter(i => i.type == 'JUPITER_SWAP');
    // console.log('Effort on jupiterTransaction', (swap.length == 1))
    if (swap.length == 1) {
        const firstTransfer = lodash_1.default.first(instructions.filter(i => i.type == 'SPL_TRANSFER')).data;
        const lastTransfer = lodash_1.default.last(instructions.filter(i => i.type == 'SPL_TRANSFER')).data;
        const tokenFromObject = tokens.find(t => t.address == firstTransfer.tokenMint);
        const tokenToObject = tokens.find(t => t.address == lastTransfer.tokenMint);
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
exports.default = jupiterTransaction;
//# sourceMappingURL=jupiterTransaction.js.map