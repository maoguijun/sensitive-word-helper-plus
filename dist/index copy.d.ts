/**
 * Created by ChengZheLin on 2019/6/3.
 * Features: index
 */
import { Tree } from './core';
interface FilterValue {
    text?: string | boolean;
    filter: Array<string>;
    pass?: boolean;
}
interface MintConstructor {
    keywords: Array<string>;
    neglectwords?: Array<string>;
    replacement?: string;
}
declare class SensitiveWord extends Tree {
    /**
     * 兼容1.1.6
     */
    static default: any;
    constructor(obj: MintConstructor);
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
export = SensitiveWord;
