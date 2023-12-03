import { InferenceFnProps, InferenceResult } from "../types";

const unknown = async (props: InferenceFnProps): Promise<InferenceResult> => {
	const { instructions } = props;
	// console.log('Effort on unknown', true)
	return {
		type: "UNKNOWN",
		data: {},
	};
};

export default unknown;
