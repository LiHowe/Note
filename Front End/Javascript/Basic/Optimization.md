# JS性能优化
----

+ ### DocumentFragment  
https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment  
说明:  
虚拟文档片段，是没有父级文件的最小文档对象，它的变化不会引起DOM树的重新渲染(reflow),用于优化多次插入DOM操作.

+ ### 使用一次innerHTML来进行DOM更改
```javascript
var html = []
for (var i = 0; i< 1000; i++) {
  html.push(`<p>${i}</p>`)
}
document.body.innerHTML = html.join('')
```

+ ### 循环
  1. 简化终止条件  
  ```javascript
    var arr = [1,2,3,4,5]
    for(var i = 0; i < arr.length; i++) {
      //...
    }
    // 应改为
    for(var i = 0, len = arr.length; i < len; i++) {
      //...
    }
  ```
  2. 简化循环体  
  循环体的代码应该只处理需要遍历的代码，与遍历无关的代码应该提到循环体外

+ ### 多个变量合并声明  
  ```javascript
  var a = 'a'
  var b = 'b'
  var c = 'c'

  var a = 'a',
      b = 'b',
      c = 'c'
  ```

+ ### 条件分支
在条件分支较多的时候，使用switch来代替if，较少的时候可使用三目运算符

+ ### 及时释放JavaScript对象
在应用中，随着实例化对象的数量以及属性的不断增多，内存消耗也会越来越大。所以应当及时释放对象的引用来释放内存。
