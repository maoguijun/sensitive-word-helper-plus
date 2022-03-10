"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/*
 * @Author: maoguijun
 * @Date: 2019-09-27 11:41:26
 * @LastEditors: maoguijun
 * @LastEditTime: 2022-03-10 18:40:00
 * @FilePath: \sensitive-word-helper\src\index.ts
 */
const sensitiveWithoutStep_1 = __importDefault(require("./sensitiveWithoutStep"));
const sensitiveWithStep_1 = __importDefault(require("./sensitiveWithStep"));
class SensitiveWordHelp {
    constructor(obj) {
        const { step } = obj;
        if (step) {
            this.instans = new sensitiveWithStep_1.default(obj);
        }
        else {
            this.instans = new sensitiveWithoutStep_1.default(obj);
        }
    }
    /**
     * 异步快速检测字符串是否无敏感词
     * @param word
     */
    every(word) {
        return this.instans.every(word);
    }
    /**
     * 同步快速检测字符串是否无敏感词
     * @param word
     */
    everySync(word) {
        return this.instans.everySync(word, true);
    }
    /**
     * 同步过滤方法
     * @param word
     * @param replace
     */
    filterSync(word, replace = true) {
        return this.instans.filterSync(word, false, replace);
    }
    /**
     * 异步过滤方法
     * @param word
     * @param replace
     */
    filter(word, replace = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.instans.filter(word, false, replace);
        });
    }
}
SensitiveWordHelp.default = SensitiveWordHelp;
module.exports = SensitiveWordHelp;
//# sourceMappingURL=index.js.map