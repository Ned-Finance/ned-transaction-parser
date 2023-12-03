import { Idl } from "@coral-xyz/anchor";
import jupiterSwap from "../humanize/fn/jupiterSwap";
import jupiterSwapV2 from "../humanize/fn/jupiterSwapV2";
import jupiterSwapV4 from "../humanize/fn/jupiterSwapV4";
import orcaWhirpoolFn from "../humanize/fn/orcaWhirpool";
import tensorswapFn from "../humanize/fn/tensorswap";
import meteoraVaultFn from "../humanize/meteoraVault/instructions";
import MeteoraVaultIdl from "../humanize/meteoraVault/meteoraVault.json";
import nedWalletVaultsFn from "../humanize/nedVaults/instructions";
import NedWalletVaults from "../humanize/nedVaults/ned_wallet_vaults.json";
import JupiterSwapIdl from "../idl/jupiter.json";
import JupiterSwapIdlV2 from "../idl/jupiterV2.json";
import JupiterSwapIdlV4 from "../idl/jupiterV4.json";
import TensorSwapIdl from "../idl/tensorswap.json";
import OrcaWhirpoolIdl from "../idl/whirlpool.json";
import { ProtocolProgram } from "./types";

const protocolsPrograms: ProtocolProgram[] = [
	{
		programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
		name: "Jupiter Swap",
		idl: JupiterSwapIdl as unknown as Idl,
		humanizeFn: jupiterSwap,
	},
	{
		programId: "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo",
		name: "Jupiter Swap V2",
		idl: JupiterSwapIdlV2 as unknown as Idl,
		humanizeFn: jupiterSwapV2,
	},
	{
		programId: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
		name: "Jupiter Swap V4",
		idl: JupiterSwapIdlV4 as unknown as Idl,
		humanizeFn: jupiterSwapV4,
	},
	{
		programId: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
		name: "Tensor Swap",
		idl: TensorSwapIdl as unknown as Idl,
		humanizeFn: tensorswapFn,
	},
	{
		programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
		name: "Orca Whirpool",
		idl: OrcaWhirpoolIdl as unknown as Idl,
		humanizeFn: orcaWhirpoolFn,
	},
	{
		programId: "NEDXqFFWdkRYUE9oRRAteiS22tXDvBiSZgNcGn9G5QA",
		name: "Ned Vaults",
		idl: NedWalletVaults as unknown as Idl,
		humanizeFn: nedWalletVaultsFn,
	},
	{
		programId: "24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi",
		name: "Meteora Vault Program",
		idl: MeteoraVaultIdl as unknown as Idl,
		humanizeFn: meteoraVaultFn,
	},
];

export default protocolsPrograms;
