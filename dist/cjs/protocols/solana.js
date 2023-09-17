"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const computeBudgetProgram_1 = tslib_1.__importDefault(require("../humanize/fn/computeBudgetProgram"));
const systemProgram_1 = tslib_1.__importDefault(require("../humanize/fn/systemProgram"));
const tokenprogram_1 = tslib_1.__importDefault(require("../humanize/fn/tokenprogram"));
const solanaPrograms = [
    {
        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        name: "Token Program",
        humanizeFn: tokenprogram_1.default
    },
    {
        programId: "11111111111111111111111111111111",
        name: "System Program",
        humanizeFn: systemProgram_1.default
    },
    {
        programId: "ComputeBudget111111111111111111111111111111",
        name: "Compute Budget",
        humanizeFn: computeBudgetProgram_1.default
    },
];
exports.default = solanaPrograms;
//# sourceMappingURL=solana.js.map