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

class SensitiveWord extends Tree {
  /**
   * 兼容1.1.6
   */
  static default: any;
  // 是否替换原文本敏感词
  constructor(obj: SwhpConstructor) {
    super();
    const { keywords, step, replacement } = obj;
    if (!(keywords instanceof Array && keywords.length >= 1)) {
      console.error('mint-filter：未将过滤词数组传入！');
      return;
    }

    if (typeof replacement === 'string') {
      this.replacement = replacement;
    }

    if (Number[Symbol.hasInstance](step)) {
      this.step = step;
    }

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
    const valStep = this.step + 1;
    let startIndex = 0;
    let endIndex = startIndex;
    const wordLen = word.length;
    let originalWord: string = word;
    let filterKeywords: Array<string> = [];

    let originalCacheText: string = '';
    let filterCacheText: string = '';
    word = word.toLocaleUpperCase();

    // 当前步数
    let step: number = 0;

    // 保存过滤文本
    let filterText: string = '';

    // 是否通过，无敏感词
    let isPass = true;

    // 正在进行划词判断
    let isJudge: boolean = false;
    let judgeText: string = '';

    // 上一个Node与当前Node
    let prevNode: Node = this.root;
    let currNode: Node | boolean;

    for (endIndex; endIndex <= wordLen; endIndex++) {
      let key: string = word[endIndex];
      let originalKey: string = originalWord[endIndex];
      currNode = this.search(key, prevNode.children);

      // 上一个是，这一个也是
      if (isJudge && currNode) {
        if (replace) {
          filterCacheText += this.replacement; // 这个不光记录字符，同时还记录了是否在寻找字符
          originalCacheText += key;
        }
        judgeText += originalKey;
        prevNode = currNode;
        continue;
      } else if (isJudge && prevNode.word) {
        // 上一个是，这个不是，但是上一个是节点的最后一个；
        isPass = false;
        isJudge = false;
        if (every) {
          break;
        }
        if (replace) {
          console.log(105, filterCacheText);
          filterText += filterCacheText;
          filterCacheText = '';
          originalCacheText = '';
        }
        filterKeywords.push(judgeText);
        judgeText = '';
        step = 0;
      } else if (isJudge) {
      } else if (step && step <= valStep && currNode) {
        // 或者在步长内找到了目标
        step = 0;
      } else if (step && step <= valStep) {
        // 在步长内没有找到
        // filterCacheText += judgeText;
        // originalCacheText += judgeText;
      } else if (replace) {
        filterText += judgeText;
        judgeText = '';
      }

      // 直接在分支上找不到，就返回上一级找，依次找到root
      if (!currNode && !step) {
        let failure: Node = prevNode.failure;

        while (failure) {
          currNode = this.search(key, failure.children);
          if (currNode) {
            break;
          }
          failure = failure.failure;
        }
      }
      console.log(103, currNode);
      if (currNode) {
        judgeText += originalKey;
        isJudge = true;
        prevNode = currNode;
        step++;
        if (replace) {
          filterCacheText += this.replacement; // 这个不光记录字符，同时还记录了是否在寻找字符
          originalCacheText += originalKey;
        }
      } else {
        // 如果step 还在设定的范围内，则继续寻找

        if ((isJudge || step) && step < valStep) {
          if (replace) {
            filterCacheText += originalKey;
            originalCacheText += originalKey;
          }
          step++;
        } else {
          step = 0;
          judgeText = '';
          prevNode = this.root;
          if (replace) {
            if (key !== undefined) {
              filterText += originalKey;
            }
            filterCacheText = '';
            originalCacheText = '';
          }
        }

        isJudge = false;
      }
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

SensitiveWord.default = SensitiveWord;

export = SensitiveWord;

if (require.main === module) {
  // ['bd', 'b'] 1bbd2 1bdb2 1bbdb2
  // ['bd', 'db'] 1bddb2
  let m = new SensitiveWord({ keywords: ['淘宝', '拼多多', '京东', 'TEST'] });
  console.log(
    m.filterSync(
      '双十一在淘宝买东西，618在京东买东西，当然你也可以在拼多多买东西。'
    )
  );
  console.log(m.filterSync('这是另外的TEST字符串'));
  console.log(m.everySync('测试这条语句是否能通过，加上任意一个关键词京东'));
}
