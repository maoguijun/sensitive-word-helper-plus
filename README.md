# sensitive word helper

基于 https://github.com/ZhelinCheng/sensitive-word-helper 做的修改

## 📦 安装

```
npm i -S sensitive-word-helper
```

或

```
yarn add sensitive-word-helper
```

## 🎉 使用

### NodeJS

```javascript
const SWH = require('sensitive-word-helper');
const swh = new SWH({
   keywords: ['敏感词数组'];
  neglectwords?:['忽略的字符数组']; // 比如 [' '] 'a  b' 也可以匹配到 'ab'
  replacement?: ['替换后的字符']; // 默认是 *, 比如 'a b' 默认会替换成  '* *'
});

// 异步方法，该方法返回的是一个Promise对象
swh.filter('word').then(res => {});

// 同步方法
swh.filterSync('word');
```

### TypeScript

```typescript
import SWH from 'sensitive-word-helper';
const swh = new SWH({ keywords: ['敏感词数组'] });

// 异步方法，该方法返回的是一个Promise对象
swh.filter('word').then(res => {});

// 同步方法
swh.filterSync('word');
```

### 特殊匹配

一般的过滤情况，如`['AB', 'CD', 'EF']`匹配`1AB2CD3EF`会直接完整正常匹配。
但有一种特殊情况，如`['BD', 'DB']`匹配`BBDB`，在这种情况下，BDB 可以划分成 BD 和 DB 两种情况，但在这里会直接合并匹配 BDB。最终结果会变成`B***`。

### 方法

所有方法都提供同步/异步两种。英文字母会全部转换成大写比较。

#### filter(word， replace)

- `word`<[string]>：需要过滤的字符串。
- `replace`<[boolean]>：是否需要替换敏感词（替换成\*，默认开启）。
- returns: <[Promise]<[FilterValue]>>

该方法将返回过滤文本和被过滤的敏感词。

```typescript
import SWH from 'sensitive-word-helper';
const swh = new SWH({ keywords: ['敏感词数组'] });

swh.filter('这是一个敏感词字符串').then(data => {
  console.log(data); // { text: '这是一个***字符串', filter: [ '敏感词' ], pass: false }
});

swh.filter('这是一个敏感词字符串', false).then(data => {
  console.log(data); // { text: '这是一个敏感词字符串', filter: [ '敏感词' ], pass: false }
});
```

#### filterSync(word， replace)

- `word`<[string]>：filter 的同步方法。
- `replace`<[boolean]>：是否需要替换敏感词（替换成\*，默认开启）。
- returns: <[FilterValue]>

#### every(word)

- `word`<[string]>：需要验证的字符串文本。
- returns: <[Promise]<[boolean]>>

判断文本是否通过敏感词验证，发现敏感词立即返回`false`，为`true`表示通过验证，没有敏感词。该方法是一个异步方法，将会返回一个 Promise 对象。

```typescript
import SWH from 'sensitive-word-helper';
const swh = new SWH(['敏感词']);

swh.every('这是一个敏感词字符串').then(data => {
  console.log(data); // true
});
```

#### everySync(word)

- `word`<[string]>：需要验证的字符串文本。
- returns: <[boolean]>
