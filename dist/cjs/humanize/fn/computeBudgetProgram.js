"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse = async (parsed, connection) => {
    return {
        data: {
            rawInstruction: parsed
        }
    };
};
exports.default = async (parsed, connection) => {
    const partialTransaction = await parse(parsed, connection);
    // console.log('Compute Budget program: ', partialTransaction)
    return {
        data: partialTransaction.data,
        type: 'COMPUTE_BUDGET',
        relevance: 'SECONDARY'
    };
};
//# sourceMappingURL=computeBudgetProgram.js.map