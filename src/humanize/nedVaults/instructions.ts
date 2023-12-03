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

const deposit = async (
	parsed: ParsedInstruction<Idl, string>,
	fromBalance: boolean
): Promise<Partial<ReadableParsedInstruction>> => {
	const args = parsed.args as any;
	// console.log("parsed ==>", parsed);
	const vaultAddress = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "vaultAccount"
	)!.pubkey.toBase58();

	const mint = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "mint"
	)!.pubkey.toBase58();

	return {
		data: {
			vaultAddress,
			mint,
			fromBalance,
			identifier: Buffer.from(args["identifier"]).toString(),
			amount: args["identifier"] ? Number(args["amount"]) : undefined,
			action: "DEPOSIT",
			rawInstruction: parsed,
		},
	};
};

const withdraw = async (
	parsed: ParsedInstruction<Idl, string>
): Promise<Partial<ReadableParsedInstruction>> => {
	const args = parsed.args as any;
	// console.log("parsed ==>", parsed);
	const vaultAddress = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "vaultAccount"
	)!.pubkey.toBase58();

	const mint = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "mint"
	)!.pubkey.toBase58();

	return {
		data: {
			vaultAddress,
			mint,
			identifier: Buffer.from(args["identifier"]).toString(),
			action: "WITHDRAW",
			amount: args["identifier"] ? Number(args["amount"]) : undefined,
			rawInstruction: parsed,
		},
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
			"depositToVaultWithDiffBalance",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["NED_VAULTS", await deposit(parsed, true)])
				)
		)
		.with(
			"depositLiquidityWithDiffBalance",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["NED_VAULTS", await deposit(parsed, true)])
				)
		)
		.with(
			"depositLiquidity",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["NED_VAULTS", await deposit(parsed, false)])
				)
		)
		.with(
			"withdrawLiquidity",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["NED_VAULTS", await withdraw(parsed)])
				)
		)
		.with(
			"withdrawFromVault",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["NED_VAULTS", await withdraw(parsed)])
				)
		)
		.otherwise(
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["UNKNOWN", await defaultHandler(parsed)])
				)
		);

	// console.log('Jupiter Program V4:', partialTransaction)

	return {
		data: partialTransaction.data!,
		type: type,
		relevance: "PRIMARY",
	};
};
