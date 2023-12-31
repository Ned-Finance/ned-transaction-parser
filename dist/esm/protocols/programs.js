import jupiterSwap from '../humanize/fn/jupiterSwap';
import jupiterSwapV2 from '../humanize/fn/jupiterSwapV2';
import jupiterSwapV4 from '../humanize/fn/jupiterSwapV4';
import orcaWhirpoolFn from '../humanize/fn/orcaWhirpool';
import tensorswapFn from '../humanize/fn/tensorswap';
import JupiterSwapIdl from '../idl/jupiter.json';
import JupiterSwapIdlV2 from '../idl/jupiterV2.json';
import JupiterSwapIdlV4 from '../idl/jupiterV4.json';
import TensorSwapIdl from '../idl/tensorswap.json';
import OrcaWhirpoolIdl from '../idl/whirlpool.json';
const protocolsPrograms = [
    {
        programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        name: "Jupiter Swap",
        idl: JupiterSwapIdl,
        humanizeFn: jupiterSwap
    },
    {
        programId: "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo",
        name: "Jupiter Swap V2",
        idl: JupiterSwapIdlV2,
        humanizeFn: jupiterSwapV2
    },
    // {
    //     programId: "JUP3c2Uh3WA4Ng34tw6kPd2G4C5BB21Xo36Je1s32Ph",
    //     name: "Jupiter Swap V3",
    //     idl: JupiterSwapIdlV3 as unknown as Idl,
    //     humanizeFn: jupiterSwapV3
    // },
    {
        programId: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB",
        name: "Jupiter Swap V4",
        idl: JupiterSwapIdlV4,
        humanizeFn: jupiterSwapV4
    },
    {
        programId: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        name: "Tensor Swap",
        idl: TensorSwapIdl,
        humanizeFn: tensorswapFn
    },
    {
        programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
        name: "Orca Whirpool",
        idl: OrcaWhirpoolIdl,
        humanizeFn: orcaWhirpoolFn
    },
];
export default protocolsPrograms;
//# sourceMappingURL=programs.js.map