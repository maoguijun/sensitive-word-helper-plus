/**
 * Created by ChengZheLin on 2019/6/3.
 * Features: index
 */
import { Node, Tree } from './core';

interface FilterValue {
  text?: string | boolean;
  filter: Array<string>;
  pass?: boolean;
}

interface SwhpConstructor {
  keywords: Array<string>;
  replacement?: string;
  step?: number;
}

class SensitiveWithoutStep extends Tree {
  /**
   * 兼容1.1.6
   */
  static default: any;
  // 是否替换原文本敏感词
  constructor(obj: SwhpConstructor) {
    super();
    const { keywords, step, replacement } = obj;

    if (!(keywords instanceof Array && keywords.length >= 1)) {
      console.error('Sensitive-word：未将过滤词数组传入！');
      return;
    }

    if (typeof replacement === 'string') {
      this.replacement = replacement;
    }
    this.step = 0;

    // 创建Trie树
    for (let item of keywords) {
      if (!item) continue;
      this.insert(item.toLocaleUpperCase());
    }

    this._createFailureTable();
  }

  _filterFn(
    word: string,
    every: boolean = false,
    replace: boolean = true
  ): FilterValue {
    let startIndex = 0;
    let endIndex = startIndex;
    const wordLen = word.length;
    let originalWord: string = word;
    let filterKeywords: Array<string> = [];
    word = word.toLocaleUpperCase();

    // 保存过滤文本
    let filterText: string = '';

    // 是否通过，无敏感词
    let isPass = true;

    // 正在进行划词判断
    let isJudge: boolean = false;
    let judgeText: string = '';

    // 上一个Node与下一个Node
    let prevNode: Node = this.root;
    let currNode: Node | boolean;

    for (endIndex; endIndex <= wordLen; endIndex++) {
      let key: string = word[endIndex];
      let originalKey: string = originalWord[endIndex];
      currNode = this.search(key, prevNode.children);

      if (isJudge && currNode) {
        if (replace) judgeText += originalKey;
        prevNode = currNode;
        continue;
      } else if (isJudge && prevNode.word) {
        isPass = false;
        if (every) break;

        if (replace) filterText += '*'.repeat(endIndex - startIndex);
        filterKeywords.push(word.slice(startIndex, endIndex));
      } else if (replace) {
        filterText += judgeText;
      }

      if (!currNode) {
        // 直接在分支上找不到，需要走failure
        let failure: Node = prevNode.failure;

        while (failure) {
          currNode = this.search(key, failure.children);
          if (currNode) break;
          failure = failure.failure;
        }
      }

      if (currNode) {
        judgeText = originalKey;
        isJudge = true;
        prevNode = currNode;
      } else {
        judgeText = '';
        isJudge = false;
        prevNode = this.root;
        if (replace && key !== undefined) filterText += originalKey;
      }
      startIndex = endIndex;
    }

    return {
      text: replace ? filterText : originalWord,
      filter: [...new Set(filterKeywords)],
      pass: isPass
    };
  }

  /**
   * 异步快速检测字符串是否无敏感词
   * @param word
   */
  every(word: string): Promise<boolean> {
    return Promise.resolve(this._filterFn(word, true).pass);
  }

  /**
   * 同步快速检测字符串是否无敏感词
   * @param word
   */
  everySync(word: string): boolean {
    return this._filterFn(word, true).pass;
  }

  /**
   * 同步过滤方法
   * @param word
   * @param replace
   */
  filterSync(word: string, replace: boolean = true): FilterValue {
    return this._filterFn(word, false, replace);
  }

  /**
   * 异步过滤方法
   * @param word
   * @param replace
   */
  async filter(word: string, replace: boolean = true): Promise<FilterValue> {
    return Promise.resolve(this._filterFn(word, false, replace));
  }
}

SensitiveWithoutStep.default = SensitiveWithoutStep;

export = SensitiveWithoutStep;
