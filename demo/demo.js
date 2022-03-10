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
  step: 2,
});

const run = async () => {
  console.log(await swhp.every("1"));
  console.log(await swhp.everySync("12"));
  console.log(swhp.filterSync("123"));
  console.log(await swhp.filter("1234"));
  console.log(swhp.filterSync("12345"));
};
run();

// // 异步方法，该方法返回的是一个Promise对象
// swhp.filter('word').then(res => {});

// // 同步方法
// swhp.filterSync('word');
