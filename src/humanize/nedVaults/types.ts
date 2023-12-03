import { RawInstruction } from "../types";

export type NedVaultInstruction = {
	vaultAddress: string;
	mint: string;
	identifier: string;
	fromBalance: boolean;
	amount: string | undefined;
	action: "DEPOSIT" | "WITHDRAW";
} & RawInstruction;

export type NedVaultTransaction = {} & NedVaultInstruction;
