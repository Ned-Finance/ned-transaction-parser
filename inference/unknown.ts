import { InferenceFnProps, ReadableParsedTransaction } from "../humanize/types";

const unknown = async (props: InferenceFnProps): Promise<Partial<ReadableParsedTransaction> | null> => {
    const { instructions } = props
    const swap = instructions.filter(i => i.type == 'SPL_TRANSFER')

    return {
        type: 'UNKNOWN',
        data: {}
    }
}

export default unknown