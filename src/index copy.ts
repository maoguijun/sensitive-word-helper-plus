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

interface MintConstructor {
  keywords: Array<string>;
  neglectwords?: Array<string>;
  replacement?: string;
}

class SensitiveWord extends Tree {
  /**
   * 兼容1.1.6
   */
  static default: any;
  // 是否替换原文本敏感词
  constructor(obj: MintConstructor) {
    super();
    const { keywords, neglectwords, replacement } = obj;
    if (!(keywords instanceof Array && keywords.length >= 1)) {
      console.error('mint-filter：未将过滤词数组传入！');
      return;
    }
    if (Array.isArray(neglectwords)) {
      this.neglectwords = neglectwords;
    }
    if (typeof replacement === 'string') {
      this.replacement = replacement;
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
    let startIndex = 0;
    let endIndex = startIndex;
    const wordLen = word.length;
    let originalWord: string = word;
    let filterKeywords: Array<string> = [];
    let spareText: string = ''; // 当敏感字之间有neglectwords 的时候才会起作用
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

    // 保存filterKey
    let filterKey: string = '';

    for (endIndex; endIndex <= wordLen; endIndex++) {
      let key: string = word[endIndex];
      let originalKey: string = originalWord[endIndex];
      currNode = this.search(key, prevNode.children);

      // console.log(
      //   'key:',
      //   key,
      //   'originalKey:',
      //   originalKey,
      //   'judgeText:',
      //   judgeText,
      //   'currNode:',
      //   currNode,
      //   'prevNode:',
      //   prevNode,
      //   'spareText:',
      //   spareText
      // );

      if (isJudge && currNode) {
        if (replace) {
          if (spareText) {
          } else {
            judgeText += originalKey;
          }
        }
        prevNode = currNode;
        continue;
      } else if (isJudge && prevNode.word) {
        isPass = false;
        if (every) {
          break;
        }
        if (replace) {
          if (spareText) {
            filterText += spareText;
          } else {
            // filterText += this.replacement.repeat(endIndex - startIndex);
          }
        }
        filterKeywords.push(filterKey);
        filterKey = '';
      } else if (this.neglectwords.includes(judgeText)) {
        // 他的作用就是隔开来，跟其他的情况做区分
      } else if (replace) {
        if (spareText) {
        } else {
          filterText += judgeText;
        }
      }

      if (!currNode) {
        // 直接在分支上找不到，需要走failure
        let failure: Node = prevNode.failure;

        while (failure) {
          currNode = this.search(key, failure.children);
          if (currNode) {
            break;
          }
          failure = failure.failure;
        }
      }
      // 如果找到了那么就是敏感词，否则就跳出到root
      // 加一个规则，用来适配例如 "法  轮  功" 这样由空格或者其他分隔符的

      if (currNode) {
        judgeText = originalKey;
        isJudge = true;
        prevNode = currNode;
        spareText += this.replacement;
        filterKey += originalKey;
      } else if (this.neglectwords.includes(originalKey)) {
        judgeText = originalKey;
        spareText += originalKey;
        isJudge = false;
      } else {
        judgeText = '';
        isJudge = false;
        prevNode = this.root;
        if (replace && key !== undefined) {
          filterText += originalKey;
        }
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
