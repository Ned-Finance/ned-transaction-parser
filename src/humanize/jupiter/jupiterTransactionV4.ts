import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import _ from "lodash";
import { WSOL_ADDRESS, getAccountMint } from "../../utils/token";
import {
	InferenceFnProps,
	InferenceResult,
	SwapTransaction,
	Transfer,
} from "../types";

const jupiterTransactionV4 = async (
	props: InferenceFnProps
): Promise<InferenceResult> => {
	const { instructions, tokens, walletAddress, connection } = props;
	const swap = instructions.filter((i) => i.type == "JUPITER_SWAP_V4");
	// console.log('Effort on jupiterTransactionV4', (swap.length == 1))
	if (swap.length == 1) {
		const transfers = instructions.filter((i) => {
			const isSPLTransfer = i.type == "SPL_TRANSFER";
			const isSOLTransfer =
				i.type == "SOL_TRANSFER" && (i.data as Transfer).from == walletAddress;
			return isSPLTransfer || isSOLTransfer;
		});

		console.log("transfers", transfers);

		const ownerTransferIdx = _.findIndex(
			transfers.filter((i) => {
				return (
					(i.data as Transfer).owner == walletAddress ||
					(i.data as Transfer).from == walletAddress
				);
			})
		);

		const transferToOwnerIdx = (
			await Promise.all(
				transfers.map((i, index) => {
					if (index != ownerTransferIdx) {
						return new Promise(async (resolve) => {
							const to = (i.data as Transfer).to;
							const toForOwner = await getAccount(connection, new PublicKey(to))
								.then((account) => account.owner.toBase58() == walletAddress)
								.catch((e) => false);
							if (!toForOwner) {
								if (walletAddress) {
									const wSolAddress = getAssociatedTokenAddressSync(
										new PublicKey(WSOL_ADDRESS),
										new PublicKey(walletAddress)
									);
									resolve(wSolAddress.toBase58() == to);
								} else resolve(false);
							} else resolve(toForOwner);
						});
					} else return Promise.resolve(false);
				})
			)
		).findIndex((r) => r === true);

		const fromOwnerInstruction =
			ownerTransferIdx > -1 ? transfers[ownerTransferIdx] : null;
		const toOwnerTransferInstruction =
			transferToOwnerIdx > -1 ? transfers[transferToOwnerIdx] : null;

		const fromOwnerTransferData = fromOwnerInstruction
			? (fromOwnerInstruction.data as Transfer)
			: null;
		const toOwnerTransferData = toOwnerTransferInstruction
			? (toOwnerTransferInstruction.data as Transfer)
			: null;

		const accountFrom = fromOwnerTransferData
			? await getAccountMint(
					fromOwnerTransferData.from,
					walletAddress || "",
					connection
			  )
			: "";

		const accountTo = toOwnerTransferData
			? await getAccountMint(
					toOwnerTransferData.to,
					walletAddress || "",
					connection
			  )
			: "";

		const tokenFromObject = tokens.find((t) => t.address == accountFrom);
		const tokenToObject = tokens.find((t) => t.address == accountTo);

		const fromAmount = () => {
			if (fromOwnerTransferData) {
				if (tokenFromObject) {
					return (
						fromOwnerTransferData.amount /
						Math.pow(10, tokenFromObject.decimals)
					);
				} else {
					if (fromOwnerInstruction!.type == "SOL_TRANSFER")
						return fromOwnerTransferData.amount / Math.pow(10, 9);
					else return fromOwnerTransferData.amount;
				}
			} else return 0;
		};
		const toAmount = () => {
			if (toOwnerTransferData) {
				if (tokenToObject) {
					return (
						toOwnerTransferData.amount / Math.pow(10, tokenToObject.decimals)
					);
				} else {
					if (toOwnerTransferInstruction!.type == "SOL_TRANSFER")
						return toOwnerTransferData.amount / Math.pow(10, 9);
					else return toOwnerTransferData.amount;
				}
			} else return 0;
		};

		const swapData = {
			tokenFrom: {
				...tokenFromObject,
				amount: fromAmount(),
			},
			tokenTo: {
				...tokenToObject,
				amount: toAmount(),
			},
		} as SwapTransaction;

		return {
			type: "JUPITER_SWAP_V4",
			data: swapData,
		};
	} else return null;
};

export default jupiterTransactionV4;
