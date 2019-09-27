# sensitive word helper

## 📦 安装

```
npm i -S sensitive-word-helper-plus
```

或

```
yarn add sensitive-word-helper-plus
```

## 🎉 使用

### NodeJS

```javascript
const SWH = require('sensitive-word-helper-plus');
const swh = new SWH({
  keywords: ['敏感词数组'],
  step: 3, // 默认是0  // 比如 '敏09感23词sa数45组' 可以替换成 '*09*23*sa*45*'  // step 是从第一个不是节点的字符开始计数
  replacement: '*' // 默认是 *, 比如 'a b' 默认会替换成  '* *'
});

// 异步方法，该方法返回的是一个Promise对象
swh.filter('word').then(res => {});

// 同步方法
swh.filterSync('word');
```

### TypeScript

```typescript
import SWH from 'sensitive-word-helper-plus';
const swh = new SWH({
  keywords: ['敏感词数组'],
  step: 3, // 默认是0  // 比如 '敏09感23词sa数45组' 可以替换成 '*09*23*sa*45*'  // step 是从第一个不是节点的字符开始计数
  replacement: '*' // 默认是 *, 比如 'a b' 默认会替换成  '* *'
});

// 异步方法，该方法返回的是一个Promise对象
swh.filter('word').then(res => {});

// 同步方法
swh.filterSync('word');
```

### 方法

所有方法都提供同步/异步两种。英文字母会全部转换成大写比较。

#### filter(word， replace)

- `word`<[string]>：需要过滤的字符串。
- `replace`<[boolean]>：是否需要替换敏感词（替换成\*，默认开启）。
- returns: <[Promise]<[FilterValue]>>

该方法将返回过滤文本和被过滤的敏感词。

```typescript
import SWH from 'sensitive-word-helper-plus';
const swh = new SWH({
  keywords: ['敏感词数组'],
  step: 3, // 默认是0  // 比如 '敏09感23词sa数45组' 可以替换成 '*09*23*sa*45*'  // step 是从第一个不是节点的字符开始计数
  replacement: '*' // 默认是 *, 比如 'a b' 默认会替换成  '* *'
});

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
import SWH from 'sensitive-word-helper-plus';
const swh = new SWH({
  keywords: ['敏感词数组'],
  step: 3, // 默认是0  // 比如 '敏09感23词sa数45组' 可以替换成 '*09*23*sa*45*'  // step 是从第一个不是节点的字符开始计数
  replacement: '*' // 默认是 *, 比如 'a b' 默认会替换成  '* *'
});

swh.every('这是一个敏感词字符串').then(data => {
  console.log(data); // true
});
```

#### everySync(word)

- `word`<[string]>：需要验证的字符串文本。
- returns: <[boolean]>
