# Daily-Interview-Question

> https://github.com/Advanced-Frontend/Daily-Interview-Question



## 1. Vue key的作用

> 相关知识点: 
>
> 1. vue diff算法
> 2. vNode
> 3. [API(key) — Vue.js](https://cn.vuejs.org/v2/api/#key)

**作用**:  

首先, key的作用是用于标识vNode的唯一性的,  带唯一key的vNode不会`就地复用` (patch.js line 35, sameVnode()方法中的比较 a.key===b.key)

**不加key**且在**模板简单**(无状态组件)的情况下可以作为相同节点进行复用

**可接收类型**: `number `| `string `| `boolean `| `symbol `



### 相关知识点: diff算法

特点: 

1.  深度优先(递归), 同层级比较, 不会跨层级比较
2.  循环从首尾两端向中间收拢, 新旧首尾节点进行4次比对, 如果没有相同节点才会进行遍历查找



## 2. ['1', '2', '3'].map(parseInt)

> 该知识点主要考察`Array.map()`参数以及`parseInt`方法参数
>
> [parseInt - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/parseInt)
>
> [Array.prototype.map() - JavaScript | MDN (mozilla.org)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)

 ```JavaScript
['1' , '2' , '3' ].map(parseInt)
// 1, NaN, NaN
 ```



## 3. 函数的节流和去抖(防抖)

概念:

+ 节流: 高频事件在n秒内只执行一次
+ 去抖: 高频事件在n秒内只执行一次,n秒内再次触发则重新计算时间





## 4. Set, Map, WeakMap, WeakSet



+ Set: 无序列表, 没有重复值
+ WeakSet: 存储弱引用对象
+ Map: 键值对
+ WeakMap:  健是弱引用对象, 值任意



##  5. 事件循环(event loop)

**概念**:

+ **微任务** :  当前任务执行之后立即执行的任务,在渲染之前, 主要有Promise.then, MutationObserver
+ **宏任务 **:  正常代码, 宏任务 -> 渲染 -> 宏任务, 主要有 setTimeout, setImmerdiate, setInterval, UI渲染, I/O
+ **tick** : 每一次循环操作称为一次tick
+ **优先级**: 微任务 > 宏任务



运行顺序:

1.  执行一个宏任务
2. 如果遇到微任务则将微任务添加到微任务的任务队列
3. 宏任务执行完毕后执行微任务队列里所有的微任务
4. 渲染, GUI线程接管
5. 渲染完成后回归到JS线程, 开始下一个宏任务



题目: 

```javascript
//请写出输出内容
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
	console.log('async2');
}

console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');


```



##  6. 前端模块化发展历程



+ **IIFE**

  描述: 闭包



+ **AMD规范** 

  描述:  (Asynchronous Module Definition) 异步模块加载规范, 主要用于浏览器端

  实现: RequireJS

  用法: define([模块列表], 回调函数)

  

+ **CMD规范** 

  描述: (Common Module Definition) 通用模块加载规范, 主要用于浏览器端

  实现: Sea.js, 支持动态引用依赖

  

+ **CommonJS规范**

  描述:  同步加载, 主要用于node端

  实现: (服务器端)node, (浏览器端) webpack, browserfy

  用法: require(模块)



+ **UMD规范**

  描述: (Universal Module Definition) 通用模块规范, 支持AMD和CommonJS规范, 浏览器与node端通用



+ **ES6 Module**

  描述: ES6模块化

  用法: import 模块















