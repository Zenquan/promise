# Promise的那些事儿

>在JavaScript中，异步操作非常多见，然而在Promise之前，我们是在类似以下的做法中处理多重异步回调，每一层里都要调另一个异步函数，形成了所谓的“回调地狱”， Promis是为了解决回调地狱的方案,是一种链式操作。

## 什么是Promise？
>所谓Promise，简单说就是一个容器，里面保存着某个未来才会结束的事件（通常是一个异步操作）的结果。从语法上说，Promise 是一个对象，从它可以获取异步操作的消息。Promise 提供统一的 API，各种异步操作都可以用同样的方法进行处理。
                                                                                                                           ———《ES6入门》阮一峰

*《你不知道的js（下卷）》指出：Promise不是对回调的替代，而是在回调代码与将要执行这个任务的异步代码之间提供一种可靠的中间机制来管理回调。*

### 我的理解：
Promise是用来解决写多重回调函数实现异步操作造成代码混乱、不易维护的问题，是一种管理回调代码与执行这个任务的异步代码的中间机制。

很大一部分熟悉jQuery的朋友会说Promise和Deferred有什么区别？其实，Deferred包含了Promise在内。

### Promise三个状态

```
pending（进行中）
fulfilled（已成功）
rejected（已失败）
```

1、pending->fulfilled
2、pending->rejected

## Promise基本用法

### Promise的方法

##### Promise.prototype.then()
它的作用是为 Promise 实例添加状态改变时的回调函数。

##### Promise.prototype.catch()
.then(null, rejection)的别名，用于指定发生错误时的回调函数。

##### Promise.all()
用于将多个 Promise 实例，包装成一个新的 Promise 实例

#### Promise.race()

>Promise.race方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。
```javascript
const p = Promise.race([p1, p2, p3]);
```
上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。

Promise.race方法的参数与Promise.all方法一样，如果不是 Promise 实例，就会先调用下面讲到的Promise.resolve方法，将参数转为 Promise 实例，再进一步处理。

下面是一个例子，如果指定时间内没有获得结果，就将 Promise 的状态变为reject，否则变为resolve。
```javascript
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p
.then(console.log)
.catch(console.error);
```
上面代码中，如果 5 秒之内fetch方法无法返回结果，变量p的状态就会变为rejected，从而触发catch方法指定的回调函数。

#### Promise.resolve()
#### Promise.reject()

#### Promise.done()

#### Promise.finally()
方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。

### Promise的应用

#### Promise之前处理
```javascript
//以jQuery为例
// Get html
$.get('/test', function(html) {

  // Get json data
  $.getJSON('/api/test.json', function(json) {

    // Get the JS
    $.getScript('/assets/test.js', function() {

       // display result
       $('.result').text(json.result);

       // Add html to page
       $('body').append(html);

    });

  });

```

#### 现在使用Promise

先封装一个生产Promise的函数

```javascript
//先封装一个生产Promise的函数
let promise = function() {
    return new Promise((reslove, reject)=>{
        $.ajax({
            url: 'http: //happymmall.com/user/get_user_info.do',
            dataType: 'json',
            type: 'get',
            success(res){
                reslove(res);
            },
            error(err){
                reject(err);
            }
        })
    })
}   
```

然后于将多个 Promise 实例，包装成一个新的 Promise 实例，用then方法进行异步操作管理。

```javascript
let p1 = new promise();
let p2 = new promise();
Promise.all([p1, p2]).then((result) => {
    let [p1, p2] = result;
    console.log(p1, p2);
}).catch((err) => {
    console.log(err);
});
```

## 怎么实现一个Promise polyfill

项目的地址：[promise](https://www.github.com/zenquan/promise.git)

### promiseES6

```JavaScript
var Promise = require('../src/promiseES6.js');

Promise.all([
    $.ajax({url: './data/1.txt', dataType: 'json'}),
    $.ajax({url: './data/2.txt', dataType: 'json'})
]).then((result) => {
    let [p1, p2] = result;
    console.log(p1, p2);
}).catch((err) => {
    console.log(err);
});

``` 

##### promise

```JavaScript
var Promise = new Promise((resolve, reject)=>{
    setTimeout(resolve, 100, 'foo');
});
Promise.all([
    $.ajax({url: './data/1.txt', dataType: 'json'}),
    $.ajax({url: './data/2.txt', dataType: 'json'})
]).then((result) => {
    let [p1, p2] = result;
    console.log(p1, p2);
}).catch((err) => {
    console.log(err);
});
```
#### 测试Promise

##### 测试代码

```JavaScript
// 目前是通过他测试 他会测试一个对象
// 语法糖
Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}
module.exports = Promise;
```
##### 测试
```JavaScript
git clone xxx
cd promise
npm install
promises-aplus-tests promiseES6.js
```

参考：
[Promise 对象](http://es6.ruanyifeng.com/#docs/promise)
