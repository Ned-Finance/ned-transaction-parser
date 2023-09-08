import computeBudgetProgram from '../humanize/fn/computeBudgetProgram';
import systemProgram from '../humanize/fn/systemProgram';
import tokenProgram from '../humanize/fn/tokenprogram';
import { SolanaProgram } from './types';

const solanaPrograms: SolanaProgram[] = [
    {
        programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        name: "Token Program",
        humanizeFn: tokenProgram
    },
    {
        programId: "11111111111111111111111111111111",
        name: "System Program",
        humanizeFn: systemProgram
    },
    {
        programId: "ComputeBudget111111111111111111111111111111",
        name: "Compute Budget",
        humanizeFn: computeBudgetProgram
    },
]

export default solanaPrograms