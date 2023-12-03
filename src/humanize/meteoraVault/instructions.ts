import { Idl } from "@coral-xyz/anchor";
import {
	ParsedAccount,
	ParsedInstruction,
} from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { humanizeUnknown } from "../fn/unknown";
import { HumanizeMatchResult, ReadableParsedInstruction } from "../types";
import { MeteoraVaultInstruction } from "./types";

const deposit = async (
	parsed: ParsedInstruction<Idl, string>
): Promise<Partial<ReadableParsedInstruction>> => {
	const vaultAddress = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "vault"
	)!.pubkey.toBase58();

	return {
		data: {
			amount: Number((parsed.args as any).tokenAmount),
			vaultAddress,
			action: "DEPOSIT",
			rawInstruction: parsed,
		} as MeteoraVaultInstruction,
	};
};

const withdraw = async (
	parsed: ParsedInstruction<Idl, string>
): Promise<Partial<ReadableParsedInstruction>> => {
	const vaultAddress = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "vault"
	)!.pubkey.toBase58();

	return {
		data: {
			amount: Number((parsed.args as any).unmintAmount),
			vaultAddress,
			action: "WITHDRAW",
			rawInstruction: parsed,
		} as MeteoraVaultInstruction,
	};
};

const defaultHandler = async (
	parsed: ParsedInstruction<Idl, string>
): Promise<Partial<ReadableParsedInstruction>> => {
	return await humanizeUnknown(parsed);
};

export default async (
	parsed: ParsedInstruction<Idl, string>,
	connection: Connection
): Promise<ReadableParsedInstruction> => {
	const [type, partialTransaction]: HumanizeMatchResult = await match(
		parsed.name
	)
		.with(
			"deposit",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["METEORA_VAULT", await deposit(parsed)])
				)
		)
		.with(
			"withdraw",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["METEORA_VAULT", await withdraw(parsed)])
				)
		)
		.otherwise(
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["UNKNOWN", await defaultHandler(parsed)])
				)
		);

	return {
		data: partialTransaction.data!,
		type: type,
		relevance: "PRIMARY",
	};
};
