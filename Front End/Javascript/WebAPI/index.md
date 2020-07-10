# WEB APIs

---

## IntersectionObserver

> 用来监听一个元素是否超出可视范围

+ **用法**

```javascript
const obs = new IntersectionObserver((entries) => {
  // 当元素超出可视范围进行的操作
  // entries 为类数组(IntersectionObserverEntry)
  // 数组内每个元素包含以下属性
  /**
    boundingClientRect: DOMRectReadOnly {x: 400.28125, y: -71, width: 1014.296875, height: 87.4375, top: -71, …}
    intersectionRatio: 0.18790850043296814
    intersectionRect: DOMRectReadOnly {x: 400.28125, y: 0, width: 1014.296875, height: 16.4375, top: 0, …}
    isIntersecting: true
    isVisible: false
    rootBounds: DOMRectReadOnly {x: 0, y: 0, width: 1476.578125, height: 1103.4375, top: 0, …}
    target: div#demo
    time: 1344323.1999999988
  */
  // 官网描述: 当intersectionRatio为0的时候元素超出可视范围, 即不可见
  // 我认为 isIntersecting 也可以作为是否超出可是范围判断, false为不可见, true为可见
  console.log(entries)
})
const target = document.querySelector('#demo')
obs.observe(target) // 开启监听元素
obs.unobserve(target) // 取消监听元素
obs.disconnect() // 停止全部监听, 如需再次监听需要重新调用observe方法
```

**IE全版本不支持该API**

+ 应用场景
  1. 元素进入动画
  2. 图片等懒加载
  3. 滚动加载或者其他元素超出可视范围的操作
