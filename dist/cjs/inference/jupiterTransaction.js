"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jupiterTransaction = async (props) => {
    var _a, _b;
    const { instructions, tokens, walletAddress, connection } = props;
    const swap = instructions.filter((i) => i.type == "JUPITER_SWAP");
    if (swap.length == 1) {
        const instruction = swap[0];
        const instructionData = instruction.data;
        const sourceMint = (_a = instruction.data.rawInstruction.accounts
            .find((x) => x.name == "sourceMint")) === null || _a === void 0 ? void 0 : _a.pubkey.toBase58();
        const destinationMint = (_b = instruction.data.rawInstruction.accounts
            .find((x) => x.name == "destinationMint")) === null || _b === void 0 ? void 0 : _b.pubkey.toBase58();
        const tokenFromObject = tokens.find((t) => t.address == sourceMint);
        const tokenToObject = tokens.find((t) => t.address == destinationMint);
        const fromAmount = tokenFromObject
            ? instructionData.amountIn / Math.pow(10, tokenFromObject.decimals)
            : instructionData.amountIn;
        const toAmount = tokenToObject
            ? instructionData.amountOut / Math.pow(10, tokenToObject.decimals)
            : instructionData.amountOut;
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
exports.default = jupiterTransaction;
//# sourceMappingURL=jupiterTransaction.js.map