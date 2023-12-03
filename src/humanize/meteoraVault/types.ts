import { RawInstruction } from "../types";

export type MeteoraVaultInstruction = {
	amount: number | undefined;
	vaultAddress: string;
	action: "DEPOSIT" | "WITHDRAW";
} & RawInstruction;
