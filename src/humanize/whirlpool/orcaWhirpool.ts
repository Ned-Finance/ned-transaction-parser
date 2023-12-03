import { Idl } from "@coral-xyz/anchor";
import {
	ParsedAccount,
	ParsedInstruction,
} from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { HumanizeMatchResult, ReadableParsedInstruction } from "../types";
import { humanizeUnknown } from "../unknown/instructions";

const parseOrca = async (
	parsed: ParsedInstruction<Idl, string>,
	connection: Connection
): Promise<Partial<ReadableParsedInstruction>> => {
	const args = parsed.args as any;
	const from = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "tokenOwnerAccountA"
	)!.pubkey.toBase58();
	const to = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "tokenOwnerAccountB"
	)!.pubkey.toBase58();
	return {
		data: {
			from,
			to,
			amountIn: args.amountSpecifiedIsInput ? Number(args.amount) : 0,
			amountOut: 0,
			protocol: "ORCA",
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
			"swap",
			async () =>
				new Promise<HumanizeMatchResult>(async (resolve) =>
					resolve(["SWAP_ORCA", await parseOrca(parsed, connection)])
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
