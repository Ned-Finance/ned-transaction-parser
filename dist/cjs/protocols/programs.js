"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const jupiterSwap_1 = tslib_1.__importDefault(require("../humanize/fn/jupiterSwap"));
const jupiterSwapV2_1 = tslib_1.__importDefault(require("../humanize/fn/jupiterSwapV2"));
const jupiterSwapV4_1 = tslib_1.__importDefault(require("../humanize/fn/jupiterSwapV4"));
const orcaWhirpool_1 = tslib_1.__importDefault(require("../humanize/fn/orcaWhirpool"));
const tensorswap_1 = tslib_1.__importDefault(require("../humanize/fn/tensorswap"));
const jupiter_json_1 = tslib_1.__importDefault(require("../idl/jupiter.json"));
const jupiterV2_json_1 = tslib_1.__importDefault(require("../idl/jupiterV2.json"));
const jupiterV4_json_1 = tslib_1.__importDefault(require("../idl/jupiterV4.json"));
const tensorswap_json_1 = tslib_1.__importDefault(require("../idl/tensorswap.json"));
const whirlpool_json_1 = tslib_1.__importDefault(require("../idl/whirlpool.json"));
const protocolsPrograms = [
    {
        programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4",
        name: "Jupiter Swap",
        idl: jupiter_json_1.default,
        humanizeFn: jupiterSwap_1.default
    },
    {
        programId: "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo",
        name: "Jupiter Swap V2",
        idl: jupiterV2_json_1.default,
        humanizeFn: jupiterSwapV2_1.default
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
        idl: jupiterV4_json_1.default,
        humanizeFn: jupiterSwapV4_1.default
    },
    {
        programId: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        name: "Tensor Swap",
        idl: tensorswap_json_1.default,
        humanizeFn: tensorswap_1.default
    },
    {
        programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
        name: "Orca Whirpool",
        idl: whirlpool_json_1.default,
        humanizeFn: orcaWhirpool_1.default
    },
];
exports.default = protocolsPrograms;
//# sourceMappingURL=programs.js.map