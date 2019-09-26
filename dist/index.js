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
/**
 * Created by ChengZheLin on 2019/6/3.
 * Features: index
 */
const core_1 = require("./core");
class SensitiveWord extends core_1.Tree {
    // 是否替换原文本敏感词
    constructor(obj) {
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
            if (!item)
                continue;
            this.insert(item.toLocaleUpperCase());
        }
        this._createFailureTable();
    }
    _filterFn(word, every = false, replace = true) {
        const valStep = this.step + 1;
        let startIndex = 0;
        let endIndex = startIndex;
        const wordLen = word.length;
        let originalWord = word;
        let filterKeywords = [];
        word = word.toLocaleUpperCase();
        let judgeObjectList = {};
        // 保存过滤文本
        let filterTextArr = originalWord.split('');
        console.log(82, filterTextArr);
        // 是否通过，无敏感词
        let isPass = true;
        // // 上一个Node与当前Node
        // let prevNode: Node = this.root;
        let currNode;
        for (endIndex; endIndex <= wordLen; endIndex++) {
            let key = word[endIndex];
            let originalKey = originalWord[endIndex];
            // currNode = this.search(key, prevNode.children);
            // 分词数组如果是空的，就表示目前没有未处理的敏感词
            const judgeObjectListLeng = Object.keys(judgeObjectList).length;
            // console.log(99, endIndex, judgeObjectListLeng, key, originalKey);
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
                    continue;
                }
                let judgeObject = {
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
                // console.log(133, judgeObject);
                // 先判断有没有节点
                const currNode = this.search(key, judgeObject.prevNode.children);
                // console.log(137, key, judgeObject.prevNode.children, currNode);
                // 如果没有找到就去上一级
                if (!currNode) {
                    let failure = judgeObject.prevNode.failure;
                    let cruNode;
                    while (failure) {
                        cruNode = this.search(key, failure.children);
                        if (currNode) {
                            break;
                        }
                        failure = failure.failure;
                    }
                    // console.log(154, cruNode);
                    if (cruNode) {
                        // 找到了就又往list 中插入一个分析对象
                        let judgeObject_ = {
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
                    judgeObjectList[judgeKey] = Object.assign(Object.assign({}, judgeObject), { findNodeIndexArr, lastFindNodeIndex: endIndex, prevNode: currNode, filterKey });
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
                    });
                    continue;
                }
                // word 不是true 的情况
                if (!currNode.word) {
                    judgeObjectList[judgeKey] = Object.assign(Object.assign({}, judgeObject), { findNodeIndexArr, lastFindNodeIndex: endIndex, prevNode: currNode, filterKey });
                }
            }
        }
        return {
            text: replace ? filterTextArr.join('') : originalWord,
            filter: [...new Set(filterKeywords)],
            pass: isPass
        };
    }
    /**
     * 合并两个字符串
     * @param text1 // 已有的字符串
     * @param text2 // 需要合并上去的字符串
     */
    convetString(text1, text2) {
        const text1Len = text1.length;
        const text2Len = text2.length;
        const length = text1Len > text2Len ? text1Len : text2Len;
        let result = '';
        for (let i = 0; i < length; i++) {
            const text1Char = text1[i];
            const text2Char = text2[i];
            if (text1Char === this.replacement) {
                result += text1Char;
                continue;
            }
            if (text2Char === this.replacement) {
                result += text2Char;
                continue;
            }
            if (text1Char) {
                result += text1Char;
                continue;
            }
            result += text2Char;
        }
        return result;
    }
    /**
     * 异步快速检测字符串是否无敏感词
     * @param word
     */
    every(word) {
        return Promise.resolve(this._filterFn(word, true).pass);
    }
    /**
     * 同步快速检测字符串是否无敏感词
     * @param word
     */
    everySync(word) {
        return this._filterFn(word, true).pass;
    }
    /**
     * 同步过滤方法
     * @param word
     * @param replace
     */
    filterSync(word, replace = true) {
        return this._filterFn(word, false, replace);
    }
    /**
     * 异步过滤方法
     * @param word
     * @param replace
     */
    filter(word, replace = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(this._filterFn(word, false, replace));
        });
    }
}
SensitiveWord.default = SensitiveWord;
if (require.main === module) {
    // ['bd', 'b'] 1bbd2 1bdb2 1bbdb2
    // ['bd', 'db'] 1bddb2
    let m = new SensitiveWord({ keywords: ['淘宝', '拼多多', '京东', 'TEST'] });
    console.log(m.filterSync('双十一在淘宝买东西，618在京东买东西，当然你也可以在拼多多买东西。'));
    console.log(m.filterSync('这是另外的TEST字符串'));
    console.log(m.everySync('测试这条语句是否能通过，加上任意一个关键词京东'));
}
module.exports = SensitiveWord;
//# sourceMappingURL=index.js.map