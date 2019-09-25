// const SWHP = require('../dist');
// console.log(SWHP, data.length);

// const swhp = new SWHP({
//   keywords: ['敏感词数组'],
//   neglectwords: ['忽略的字符数组'], // 比如 [' '] 'a  b' 也可以匹配到 'ab'
//   replacement: '替换后的字符' // 默认是 *, 比如 'a b' 默认会替换成  '* *'
// });

// // 异步方法，该方法返回的是一个Promise对象
// swhp.filter('word').then(res => {});

// // 同步方法
// swhp.filterSync('word');

const axios = require('axios');
axios({
  url: './filterstring.csv',
  dataType: 'text'
}).then(data => {
  console.log(data);
});
