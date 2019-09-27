"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const sensitiveWithoutStep_1 = __importDefault(require("./sensitiveWithoutStep"));
const sensitiveWithStep_1 = __importDefault(require("./sensitiveWithStep"));
class SensitiveWordHelp {
    constructor(obj) {
        const { keywords, step, replacement } = obj;
        if (step !== undefined && step) {
            return new sensitiveWithStep_1.default(obj);
        }
        else {
            return new sensitiveWithoutStep_1.default(obj);
        }
    }
}
SensitiveWordHelp.default = SensitiveWordHelp;
module.exports = SensitiveWordHelp;
//# sourceMappingURL=index.js.map