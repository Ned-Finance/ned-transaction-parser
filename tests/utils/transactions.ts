import {
	AddressLookupTableAccount,
	VersionedTransaction,
} from "@solana/web3.js";
import { getConnection } from "./connection";

export const getLookupTableAccounts = (transaction: VersionedTransaction) => {
	return Promise.all(
		transaction.message.addressTableLookups.map(async (lookup) => {
			return new AddressLookupTableAccount({
				key: lookup.accountKey,
				state: AddressLookupTableAccount.deserialize(
					await getConnection()
						.getAccountInfo(lookup.accountKey)
						.then((res) => res!.data)
				),
			});
		})
	);
};
