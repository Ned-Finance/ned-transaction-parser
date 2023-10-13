import { Connection, clusterApiUrl } from "@solana/web3.js";

export const getConnection = () =>
	new Connection(clusterApiUrl("mainnet-beta"));
