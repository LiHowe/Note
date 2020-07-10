# 微信小程序开发
> [官网](https://developers.weixin.qq.com/miniprogram/dev/component/button.html)  
> [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
---

## 页面文件结构
```text
|pages
|-- demo
|---- demo.json  // 页面依赖组件json文件
|---- demo.wxml  // 页面dom文件
|---- demo.wxss  // 页面样式文件
|---- demo.js    // 页面逻辑文件
```

### json
页面组件相关依赖组件在该文件中注册

### wxml(html)

#### 基本标签

`<div></div>` => `<view></view>`
`<span></span>` => `<text></text>`

#### 基本语法

+ 条件渲染

```text
<text wx:if="{{condition}}></text>
```

+ 列表循环

```text
<text wx:for="{{list}}>
{{index}} {{item}}
</text>
```

### wxs & js

#### 事件绑定

#### 事件传参

### wxss(css)


## 常见问题
1. **开发者工具新版编译慢问题解决方案**  
取消勾选本地设置中的`启动多核心编译`
