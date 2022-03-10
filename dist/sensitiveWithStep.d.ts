import { Tree } from './core';
interface FilterValue {
    text?: string | boolean;
    filter: Array<string>;
    sensitiveWordIndexs?: Array<number>;
    pass?: boolean;
}
interface SwhpConstructor {
    keywords: Array<string>;
    replacement?: string;
    step?: number;
}
declare class SensitiveWithStep extends Tree {
    static default: any;
    constructor(obj: SwhpConstructor);
    _filterFn(word: string, every?: boolean, replace?: boolean): FilterValue;
    /**
     * 异步快速检测字符串是否无敏感词
     * @param word
     */
    every(word: string): Promise<boolean>;
    /**
     * 同步快速检测字符串是否无敏感词
     * @param word
     */
    everySync(word: string): boolean;
    /**
     * 同步过滤方法
     * @param word
     * @param replace
     */
    filterSync(word: string, replace?: boolean): FilterValue;
    /**
     * 异步过滤方法
     * @param word
     * @param replace
     */
    filter(word: string, replace?: boolean): Promise<FilterValue>;
}
export = SensitiveWithStep;
