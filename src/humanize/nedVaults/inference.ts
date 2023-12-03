import _ from "lodash";
import { MeteoraVaultInstruction } from "../meteoraVault/types";
import { InferenceFnProps, InferenceResult, ParsedType } from "../types";
import { NedVaultInstruction } from "./types";

const nedWalletVaults = async (
	props: InferenceFnProps
): Promise<InferenceResult> => {
	const { instructions } = props;
	const nedVaultInstructions = instructions
		.filter((i) => i.type == "NED_VAULTS")
		.map((i) => i.data) as NedVaultInstruction[];

	const meteoraVaultInstructions = instructions
		.filter((i) => i.type == "METEORA_VAULT")
		.map((i) => i.data) as MeteoraVaultInstruction[];

	console.log("meteoraVaultInstructions", meteoraVaultInstructions);

	const result = nedVaultInstructions.map((instruction) => {
		if (instruction.action == "DEPOSIT") {
			if (instruction.fromBalance) {
				const meteornDeposit = meteoraVaultInstructions.find(
					(i) => i.action == "DEPOSIT"
				);
				// console.log("meteornDeposit?.amount,", meteornDeposit?.amount, {
				// 	...instruction,
				// 	amount: meteornDeposit?.amount,
				// });
				return {
					type: "NED_VAULTS" as ParsedType,
					data: {
						...instruction,
						amount: meteornDeposit?.amount,
					},
				};
			} else {
				return {
					type: "NED_VAULTS" as ParsedType,
					data: {
						...instruction,
					},
				};
			}
		} else {
			if (instruction.fromBalance) {
				const meteornWithdraw = meteoraVaultInstructions.find(
					(i) => i.action == "WITHDRAW"
				);
				return {
					type: "NED_VAULTS" as ParsedType,
					data: {
						...instruction,
						amount: meteornWithdraw?.amount,
					},
				};
			} else {
				return {
					type: "NED_VAULTS" as ParsedType,
					data: {
						...instruction,
					},
				};
			}
		}
	});

	return _.first(_.filter(result, (t) => !_.isNull(t))) || null;
};

export default nedWalletVaults;
