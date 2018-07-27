//模块化要用webpack等工具
var Promise = require('../src/promiseES6.js');
//import {Promise} from '../src/promiseES6';ES6写法
Promise.all([
    $.ajax({url: './data/1.txt', dataType: 'json'}),
    $.ajax({url: './data/2.txt', dataType: 'json'})
]).then((result) => {
    let [p1, p2] = result;
    console.log(p1, p2);
}).catch((err) => {
    console.log(err);
});

