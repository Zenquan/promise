//模块化要用webpack等工具
import {Promise} from '../src/promiseES6';//ES6写法
Promise.all([
    $.ajax({
        url: './data/1.txt',
        dataType: 'txt',
        type: 'get'
    }),
    $.ajax({
        url: './data/2.json',
        dataType: 'json',
        type: 'get'
    })
]).then((result) => {
    let [p1, p2] = result;
    console.log('success: '+p1.responseText);
    console.log('success: '+p2.responseText);
}).catch((err) => {
    console.log(err);
});

