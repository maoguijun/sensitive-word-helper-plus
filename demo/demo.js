/*
 * @Author: maoguijun
 * @Date: 2019-09-24 09:37:16
 * @LastEditors: maoguijun
 * @LastEditTime: 2022-03-10 18:40:32
 * @FilePath: \sensitive-word-helper\demo\demo.js
 */
const SWHP = require("../dist");
// console.log(SWHP, data.length);
const data = require("./filterstring");
const swhp = new SWHP({
  keywords: data,
  step: 3,
  replacement: "",
});
console.log(16, swhp);
const run = async () => {
  console.log(await swhp.filterSync("敏09感23词sa数45组"));
};
run();

// // 异步方法，该方法返回的是一个Promise对象
// swhp.filter('word').then(res => {});

// // 同步方法
// swhp.filterSync('word');
