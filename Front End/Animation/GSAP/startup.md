# GSAP(GreenSock Animation Platform)

---

## Function

### `gsap.to(targets, vars)`

> 创建动画, 将元素从初始定义的样式位置按照vars定义的属性进行动画移动, 即 初始 => 自定义

+ targets: 元素选择器
+ vars: 动画属性及相关回调[link](https://greensock.com/docs/v3/GSAP/Tween)
  + delay: 动画延迟
  + rotation: 旋转
    + _short: 最小角度旋转, 例: rotation: "90_short"
    + _ccw: 逆时针旋转, 例: rotation: "90_ccw"
    + _cw: 顺时针旋转, 例: rotation: "90_cw"
  + ease: 缓动动画, [官网链接](https://greensock.com/get-started/)
    + none(linear/power0): 无, 即线性平滑过渡
    + power1(quad)/2(cubic)/3(quart)/4(strong/quint): 每级动画效果逐渐增强, 即曲线更加陡峭. power1, power2, power3, power4
      + in: 慢 -> 快
      + out: 快 -> 慢
      + inOut: 慢 -> 快 -> 慢
    + back: 会后退一段距离再开始前进
      + in: 后退 -> 前进
      + out: 前进 -> 后退
      + inOut: 后退 -> 前进 -> 后退
    + elastic
    + bounce
    + rough
    + slow
    + steps(n)
    + circ
    + expo
    + sine
    + Custom: CustomEase.create(Name, Path)
  + stagger: 每个目标元素动画间隔, [演示](https://codepen.io/GreenSock/full/938f5cd34818443c43af9ba2692137a5?__cf_chl_jschl_tk__=0a62d2f52ef975ab28a4b6d893ddf3ce193474b3-1576567665-0-AXFDfFfHUTX3KT-7zU_fpjqCohmv9D9lbKh_lwIXhAy4ahNnpT4RkRxa2YF5KdlwGJwcX2Ec_jCsDAS6RHMp-qscOxsmZPhoR5GrdHuc6xXzamdAqdAyiIe_oQ7dEF3YjEiUo6TK4d9hfknyP1an_aDaSEPvzAnD9mlbPhs2__Rd0gpbpSUET_gsh4zTPtZlQj5sCX0b5asZMbW_jSgofjjbaSW11sjLpnTpyPonCwMAMRTwaSeeWntu8WkAFfqgIzi367twVbyExbHb8AYMY_a4tpnscwiSuzR30ws1FE-j0EA1GL46wt4f7KR6G1pJK7_hbrbjJs0ItCUD1SliI7eVbPG5suI4n6b9fijxn-G3H6wcnR1fJOwtDCUNIdA8XQ)
  + onComplete: 动画完成回调
  + onUpdate: 每次动画更新/渲染的回调
  + onStart: 动画开始回调
  + onRepeat: 动画重复回调
  + onReverseComplete: 反向完成回调
  + onCompleteParams: 动画完成回调参数数组
  + onUpdateParams: 每次动画更新/渲染的回调参数数组
  + onStartParams: 动画开始回调参数数组
  + onRepeatParams: 动画重复回调参数数组
  + onReverseCompleteParams: 反向完成回调参数数组

例:

```javascript
// 花费1秒将id为demo的元素向右移动100px
gsap.to('#demo', {
  duration: 1,
  x: 100
})

// 也可以变换对象属性
const obj = { prop: 10 }
gsap.to(obj, {
  duration: 1,
  prop: 20,
  // 属性更新方法
  onUpdate: () => {
    // 每次更新都会打印对象prop值
    console.log(obj.prop)
  }
})
```

### `gsap.from(targets, vars)`

> 创建动画, 将元素从vars定义的属性过渡到初始定义的样式位置, 即 自定义 => 初始

例:

```javascript
// #demo元素的初始位置为x: 0, 下面方法将#demo元素从x: 100的位置动画过渡到x: 0, 用时1秒
gsap.from('#demo', {
  duration: 1,
  x: 100
})

```

### `gsap.fromTo(targets, fromVars, toVars)`

> gsap.from() 与 gsap.to() 的合并方法, 可以同时操作元素的开始与结束动画

### `gsap.timeline(vars)`: 动画序列

使用方法:

```javascript
const timeline = gsap.timeline({
  // 之后所有的动画都会沿用此配置
  defaults: {
    duration: 2,
    repeat: 30
  },
  repeat: 1,
  repeatDelay: 1,
  yoyo: true // 在动画结束的时候反向继续执行动画(悠悠球)
})
.to('.demo', {
  x: 222
})
.addLabel('demoFinish1')
.to('.demo', {
  y: 333,
  duration: 10 // 可以覆盖初始配置进行动画动作调整
}, '+=1' // 上一个动画结束1s后执行该动画 )
.from('.demo1', {
  x: -100
}, '-=1' // 上一个动画结束1s前执行该动画)
.to('.demo1', {
  scale: 3
}, 1 // 动画序列开始的1s后执行该动画)
.to('.demo', {
  rotation: 90
}, 'demoFinish1' // 在label'demoFinish1'时间戳(即.demo x: 222 动画结束后)执行该动画)
```

### 动画控制

> gsap.to() from() fromTo() 都返回tween实例

+ tweenObj.pause(): 暂停动画
+ tweenObj.resume(): 恢复动画
+ tweenObj.reverse(): 反向播放

+ tweenObj.seek(time): 动画跳到time处
+ tweenObj.progress(progress): 动画过程跳到progress处
+ tweenObj.timeScale(speed): 动画速度调整至原始速度的speed倍

+ tweenObj.kill(): 销毁实例

## Plugins

### SplitText

> 将文本块分割为行/单词/字符以便于能够轻松的给每一个部分添加动画

### Draggable

> 给任意元素添加拖/放能力

### MorphSVGPlugin

> 复杂SVG路径的平滑变形

### DrawSVGPlugin

> SVG strokes的长度和位置动画

### MotionPathPlugin

> 可以让任意元素沿着路径运动
