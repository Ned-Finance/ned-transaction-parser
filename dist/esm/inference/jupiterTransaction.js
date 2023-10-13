import _ from "lodash";
const jupiterTransaction = async (props) => {
    const { instructions, tokens, walletAddress, connection } = props;
    const swap = instructions.filter((i) => i.type == "JUPITER_SWAP");
    console.log("Effort on jupiterTransaction", JSON.stringify(instructions));
    if (swap.length == 1) {
        const firstTransfer = _.first(instructions.filter((i) => i.type == "SPL_TRANSFER")).data;
        const lastTransfer = _.last(instructions.filter((i) => i.type == "SPL_TRANSFER")).data;
        const tokenFromObject = tokens.find((t) => t.address == firstTransfer.tokenMint);
        const tokenToObject = tokens.find((t) => t.address == lastTransfer.tokenMint);
        const fromAmount = tokenFromObject
            ? firstTransfer.amount / Math.pow(10, tokenFromObject.decimals)
            : firstTransfer.amount;
        const toAmount = tokenToObject
            ? lastTransfer.amount / Math.pow(10, tokenToObject.decimals)
            : lastTransfer.amount;
        return {
            type: "JUPITER_SWAP",
            data: {
                tokenFrom: {
                    ...tokenFromObject,
                    amount: fromAmount,
                },
                tokenTo: {
                    ...tokenToObject,
                    amount: toAmount,
                },
            },
        };
    }
    else
        return null;
};
export default jupiterTransaction;
//# sourceMappingURL=jupiterTransaction.js.map