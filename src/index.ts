import { Idl } from "@coral-xyz/anchor";
import {
	ParsedInstruction,
	SolanaParser as SolanaParserCore,
	flattenTransactionResponse,
	parseLogs as parseLogsParser,
} from "@debridge-finance/solana-transaction-parser";
import {
	Connection,
	Finality,
	LoadedAddresses,
	Message,
	VersionedMessage,
} from "@solana/web3.js";
import _ from "lodash";
import jupiterTransaction from "./humanize/jupiter/jupiterTransaction";
import jupiterTransactionV2 from "./humanize/jupiter/jupiterTransactionV2";
import jupiterTransactionV4 from "./humanize/jupiter/jupiterTransactionV4";
import nedWalletVaults from "./humanize/nedVaults/inference";
import solTransfer from "./humanize/systemProgram/solTransfer";
import splTransfer from "./humanize/tokenProgram/splTransfer";
import splTransferMultiple from "./humanize/tokenProgram/splTransferMultiple";
import {
	InferenceFnProps,
	InferenceResult,
	InferenceSucess,
	ReadableParsedInstruction,
	ReadableParsedTransaction,
} from "./humanize/types";
import unknown from "./humanize/unknown/inference";
import { humanizeUnknown } from "./humanize/unknown/instructions";
import protocolsPrograms from "./protocols/programs";
import solanaPrograms from "./protocols/solana";
import { Program } from "./protocols/types";

export type SolanaParserToken = {
	name: string;
	address: string;
	symbol: string;
	decimals: number;
	logoURI: string;
};

export type SolanaParserConfig = {
	connection: Connection;
	walletAddress?: string;
	tokens?: SolanaParserToken[];
};

export default class SolanaParser {
	private _txParser: SolanaParserCore;
	private _connection: Connection;
	private _walletAddress?: string;
	private _tokens?: SolanaParserToken[];

	constructor(config: SolanaParserConfig) {
		this._connection = config.connection;
		this._walletAddress = config.walletAddress;
		this._tokens = config.tokens;
		this._txParser = new SolanaParserCore(protocolsPrograms);
	}

	private async parseProgramInstructions(
		instructions: ParsedInstruction<Idl, string>[],
		programs: Program[]
	): Promise<ReadableParsedInstruction[]> {
		const programsFound: Program[] = instructions
			.map((instruction) =>
				programs.find((program) => {
					return instruction.programId.toBase58() == program.programId;
				})
			)
			.filter((program) => !_.isUndefined(program)) as Program[];

		const parsed: Promise<ReadableParsedInstruction | undefined>[] =
			instructions.map((instruction) => {
				const program = programsFound.find(
					(p) => p.programId == instruction.programId.toBase58()
				);
				if (program) return program!.humanizeFn(instruction, this._connection);
				else return this.parseUnknownInstructions(instruction);
			});

		return (await Promise.all(parsed)).filter(
			(p) => !_.isUndefined(p)
		) as ReadableParsedInstruction[];
	}

	private async parseUnknownInstructions(
		instruction: ParsedInstruction<Idl, string>
	): Promise<ReadableParsedInstruction> {
		return new Promise<ReadableParsedInstruction>(async (resolve) => {
			const parsed = await humanizeUnknown(instruction);
			resolve({
				data: parsed.data!,
				type: "UNKNOWN",
				relevance: "SECONDARY",
			});
		});
		// }))
	}

	private async inferTransactionType(
		instructions: ReadableParsedInstruction[]
	): Promise<InferenceSucess> {
		// console.debug('Starting inference...')
		// console.debug(instructions)

		const fns = [
			nedWalletVaults,
			jupiterTransaction,
			jupiterTransactionV2,
			jupiterTransactionV4,
			splTransfer,
			solTransfer,
			splTransferMultiple,
			unknown,
		];

		const firstNonNull = async (
			fns: ((props: InferenceFnProps) => Promise<InferenceResult>)[],
			index: number
		): Promise<InferenceSucess | null> => {
			if (index < fns.length) {
				const result = await fns[index]({
					instructions,
					tokens: this._tokens ? this._tokens : [],
					walletAddress: this._walletAddress,
					connection: this._connection,
				});
				if (!_.isNull(result)) {
					return result;
				} else {
					return await firstNonNull(fns, index + 1);
				}
			} else return null;
		};

		const result = (await firstNonNull(fns, 0)) as InferenceSucess;
		return result;
	}

	private async nedParser(
		instructions: ParsedInstruction<Idl, string>[]
	): Promise<InferenceSucess & { instructions: ReadableParsedInstruction[] }> {
		const knownPrograms = (protocolsPrograms as Program[]).concat(
			solanaPrograms as Program[]
		);

		const parsedInstructions = await this.parseProgramInstructions(
			instructions,
			knownPrograms
		);
		const inferenceTransactions = await this.inferTransactionType(
			parsedInstructions
		);

		return {
			...inferenceTransactions,
			instructions: parsedInstructions,
		};
	}

	async parseTransaction(
		txId: string,
		commitment?: Finality
	): Promise<ReadableParsedTransaction | null> {
		// console.log('Start parsing transaction %s', txId)

		const transaction = await this._connection.getTransaction(txId, {
			commitment: commitment,
			maxSupportedTransactionVersion: 0,
		});
		if (!transaction) return null;
		const parsedInstructions = flattenTransactionResponse(transaction).map(
			(ix) => this._txParser.parseInstruction(ix)
		);
		if (parsedInstructions)
			return {
				...(await this.nedParser(parsedInstructions)),
				date: transaction.blockTime,
				fee: transaction.meta?.fee,
				txId,
				success: _.isNull(transaction.meta?.err),
				raw: transaction,
			};
		else return null;
	}

	async parseInstruction<T extends Message | VersionedMessage>(
		message: T,
		altLoadedAddresses?: T extends VersionedMessage
			? LoadedAddresses | undefined
			: undefined
	): Promise<ReadableParsedTransaction> {
		const parsedInstructions = this._txParser.parseTransactionData(
			message,
			altLoadedAddresses
		);
		return await this.nedParser(parsedInstructions!);
	}

	parseLogs(logs: string[]) {
		return parseLogsParser(logs);
	}

	parseTransactionDump(
		txDump: string | Buffer
	): ParsedInstruction<Idl, string>[] {
		const parsedInstruction = this._txParser.parseTransactionDump(txDump);
		return parsedInstruction;
	}
}
