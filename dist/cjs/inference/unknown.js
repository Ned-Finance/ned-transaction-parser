"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const unknown = async (props) => {
    const { instructions } = props;
    console.log('Effort on unknown', true);
    return {
        type: 'UNKNOWN',
        data: {}
    };
};
exports.default = unknown;
//# sourceMappingURL=unknown.js.map