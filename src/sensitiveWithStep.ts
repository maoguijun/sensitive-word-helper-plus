/*
 * @Author: maoguiun
 * @Date: 2019-09-23 14:35:38
 * @LastEditors: maoguiun
 * @LastEditTime: 2019-11-05 12:51:55
 * @FilePath: \sensitive-word-helper\src\sensitiveWithStep.ts
 */

import { Node, Tree } from './core';

interface FilterValue {
  text?: string | boolean;
  filter: Array<string>;
  sensitiveWordIndexs?: Array<number>;
  pass?: boolean;
}

interface SwhpConstructor {
  keywords: Array<string>;
  replacement?: string;
  step?: number
}

// 判定对象
interface JudgeObject {
  startIndex: number; // 这个对象生成的 index
  lastFindNodeIndex: number; // 找到上个节点 的index
  findNodeIndexArr: Array<number>; // 记录找到的节点的 index
  startNode: Node; // 存放开始节点
  prevNode?: Node; // 上一次找到的节点
  currNode?: Node | undefined; // 当前节点
  filterKey: string; // 存储当前敏感词，每次匹配到则自动合并过来
}

class SensitiveWithStep extends Tree {
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

    if (Number.isInteger(step) && step >= 0) {
      this.step = step;
    } else {
      console.error(
        'Sensitive-word：step 必须是非负整数, 传入数据有误，目前 step 已初始化为 3 !'
      );
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
    if (typeof word !== 'string') {
      console.error('word must be String !')
      word = ''
    }
    let startIndex = 0;
    let endIndex = startIndex;
    const wordLen = word.length;
    let originalWord: string = word;
    let filterKeywords: Array<string> = [];
    word = word.toLocaleUpperCase();
    let sensitiveWordIndexs: Array<number> = [];
    let judgeObjectList: {
      [key: string]: JudgeObject;
    } = {};

    // 保存过滤文本
    let filterTextArr: Array<string> = originalWord.split('');

    // 是否通过，无敏感词
    let isPass = true;

    // // 上一个Node与当前Node
    // let prevNode: Node = this.root;
    let currNode: Node | undefined;

    for (endIndex; endIndex <= wordLen; endIndex++) {
      let key: string = word[endIndex];
      let originalKey: string = originalWord[endIndex];
      // currNode = this.search(key, prevNode.children);

      // 分词数组如果是空的，就表示目前没有未处理的敏感词

      const judgeObjectListLeng = Object.keys(judgeObjectList).length;
      if (!judgeObjectListLeng) {
        currNode = this.search(key, this.root.children);

        if (!currNode) {
          // 没有找到就直接拼接
          if (!replace) {
            continue;
          }
          filterTextArr[endIndex] = originalKey;
          continue;
        }

        // 判断这个节点是否就是最后一个节点，针对的是单个字符的敏感词
        if (currNode.word) {
          filterTextArr[endIndex] = this.replacement;
          sensitiveWordIndexs.push(endIndex)
          continue;
        }

        let judgeObject: JudgeObject = {
          startIndex: endIndex,
          lastFindNodeIndex: endIndex,
          findNodeIndexArr: [endIndex],
          startNode: currNode,
          prevNode: currNode,
          filterKey: originalKey // 存储当前敏感词，每次匹配到则自动合并过来
        };
        judgeObjectList[String(endIndex)] = judgeObject;
        continue;
      }

      // 分词数组中不为空
      for (let judgeKey in judgeObjectList) {
        const judgeObject = judgeObjectList[judgeKey];

        // 先判断有没有节点
        const currNode = this.search(key, judgeObject.prevNode.children);
        // 如果没有找到就去上一级
        if (!currNode) {
          let failure: Node = judgeObject.prevNode.failure;
          let cruNode: Node | undefined;
          while (failure) {
            cruNode = this.search(key, failure.children);
            if (currNode) {
              break;
            }
            failure = failure.failure;
          }
          if (cruNode) {
            // 找到了就又往list 中插入一个分析对象
            let judgeObject_: JudgeObject = {
              startIndex: endIndex,
              lastFindNodeIndex: endIndex,
              findNodeIndexArr: [endIndex],
              startNode: cruNode,
              prevNode: cruNode,
              filterKey: originalKey // 存储当前敏感词，每次匹配到则自动合并过来
            };
            judgeObjectList[String(endIndex)] = judgeObject_;
          }
        }

        // 先判断这个划词对象是否过期了
        if (endIndex - judgeObject.lastFindNodeIndex > this.step) {
          // 那么跳过 ，并删除这个对象
          delete judgeObjectList[judgeKey];
        }

        // 如果没有找到currNode 或者 超过了step 那么就跳出当前循环
        if (!currNode || endIndex - judgeObject.lastFindNodeIndex > this.step) {
          continue;
        }

        // 如果找到了
        // 判断word 是否是 true
        const findNodeIndexArr = judgeObject.findNodeIndexArr.concat(endIndex);
        const filterKey = judgeObject.filterKey + originalKey;
        if (currNode.word) {
          // 这里不清理这个对象的原因是可能后面还有word 为 true 的情况
          judgeObjectList[judgeKey] = {
            ...judgeObject,
            findNodeIndexArr,
            lastFindNodeIndex: endIndex,
            prevNode: currNode,
            filterKey
          };
          isPass = false;

          if (every) {
            break;
          }

          filterKeywords.push(filterKey);
          if (!replace) {
            continue;
          }
          findNodeIndexArr.forEach(index => {
            filterTextArr[index] = this.replacement;
            sensitiveWordIndexs.push(index)
          });

          continue;
        }
        // word 不是true 的情况
        if (!currNode.word) {
          judgeObjectList[judgeKey] = {
            ...judgeObject,
            findNodeIndexArr,
            lastFindNodeIndex: endIndex,
            prevNode: currNode,
            filterKey
          };
        }
      }
    }

    return {
      text: replace ? filterTextArr.join('') : originalWord,
      filter: [...new Set(filterKeywords)],
      sensitiveWordIndexs,
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

SensitiveWithStep.default = SensitiveWithStep;

export = SensitiveWithStep;
