import { InferenceFnProps, InferenceResult, Swap } from "../humanize/types";

const jupiterTransaction = async (
	props: InferenceFnProps
): Promise<InferenceResult> => {
	const { instructions, tokens, walletAddress, connection } = props;
	const swap = instructions.filter((i) => i.type == "JUPITER_SWAP");
	if (swap.length == 1) {
		const instruction = swap[0];
		const instructionData = instruction.data as Swap;
		const sourceMint = instruction.data.rawInstruction.accounts
			.find((x) => x.name == "sourceMint")
			?.pubkey.toBase58();
		const destinationMint = instruction.data.rawInstruction.accounts
			.find((x) => x.name == "destinationMint")
			?.pubkey.toBase58();

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
	} else return null;
};

export default jupiterTransaction;
