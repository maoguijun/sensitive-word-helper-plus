/*
 * @Author: maoguijun
 * @Date: 2019-09-27 11:41:26
 * @LastEditors: maoguijun
 * @LastEditTime: 2022-03-10 18:40:00
 * @FilePath: \sensitive-word-helper\src\index.ts
 */
import SensitiveWithoutStep from './sensitiveWithoutStep';
import SensitiveWithStep from './sensitiveWithStep';

interface SwhpConstructor {
  keywords: Array<string>;
  replacement?: string;
  step?: number;
}

interface FilterValue {
  text?: string | boolean;
  filter: Array<string>;
  sensitiveWordIndexs?: Array<number>;
  pass?: boolean;
}

class SensitiveWordHelp {
  static default: any;
  constructor(obj: SwhpConstructor) {
    const { step } = obj;
    if (step) {
      this.instans = new SensitiveWithStep(obj);
    } else {
      this.instans = new SensitiveWithoutStep(obj);
    }
  }
  instans: any;

  /**
   * 异步快速检测字符串是否无敏感词
   * @param word
   */
  every(word: string): Promise<boolean> {
    return this.instans.every(word);
  }

  /**
   * 同步快速检测字符串是否无敏感词
   * @param word
   */
  everySync(word: string): boolean {
    return this.instans.everySync(word, true);
  }

  /**
   * 同步过滤方法
   * @param word
   * @param replace
   */
  filterSync(word: string, replace: boolean = true): FilterValue {
    return this.instans.filterSync(word, replace);
  }

  /**
   * 异步过滤方法
   * @param word
   * @param replace
   */
  async filter(word: string, replace: boolean = true): Promise<FilterValue> {
    return this.instans.filter(word, replace);
  }
}

SensitiveWordHelp.default = SensitiveWordHelp;

export = SensitiveWordHelp;

