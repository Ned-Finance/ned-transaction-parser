import { InferenceFnProps, InferenceResult } from "../humanize/types";

const unknown = async (props: InferenceFnProps): Promise<InferenceResult> => {
    const { instructions } = props
    const swap = instructions.filter(i => i.type == 'SPL_TRANSFER')

    return {
        type: 'UNKNOWN',
        data: {},
        instructions
    }
}

export default unknown