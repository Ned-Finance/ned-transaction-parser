import { Idl } from "@coral-xyz/anchor";
import {
	ParsedAccount,
	ParsedInstruction,
} from "@debridge-finance/solana-transaction-parser";
import { Connection } from "@solana/web3.js";
import _ from "lodash";
import { match } from "ts-pattern";
import { ParsedType, ReadableParsedInstruction } from "../types";
import { humanizeUnknown } from "../unknown/instructions";

const parseSwap = async (
	parsed: ParsedInstruction<Idl, string>,
	connection: Connection
): Promise<Partial<ReadableParsedInstruction>> => {
	const args = parsed.args as any;
	const from = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "sourceTokenAccount"
	)!.pubkey.toBase58();
	const to = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "destinationTokenAccount"
	)!.pubkey.toBase58();
	const authority = _.find(
		parsed.accounts,
		(account: ParsedAccount) => account.name == "userTransferAuthority"
	)!.pubkey.toBase58();
	return {
		data: {
			from,
			to,
			amountIn: Number(args.inAmount),
			amountOut: Number(args.quotedOutAmount),
			authority,
			protocol: "JUPITER",
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
	const getType = (): ParsedType =>
		match(parsed.name)
			.with("sharedAccountsRoute", () => "JUPITER_SWAP")
			.otherwise(() => "UNKNOWN") as ParsedType;

	const partialTransaction = await match(parsed.name)
		.with(
			"sharedAccountsRoute",
			async () => await parseSwap(parsed, connection)
		)
		.otherwise(async () => await defaultHandler(parsed));

	// console.log('Jupiter Program:', partialTransaction)

	return {
		data: partialTransaction.data!,
		type: getType(),
		relevance: "PRIMARY",
	};
};
