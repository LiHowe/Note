# Vue components

## 组件之间的通信

>Vue.js的组件渲染顺序是由内而外的。
父组件的created要早与子组件的mounted。

### $parent / $children

### provide / inject

这对选项需要一起使用，以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效

* `provide: Object | () => Object `

    父组件提供对象, 值为一个对象或者返回一个对象的函数

* `inject: Array<String> | { [key: string]: string | Symbol | Object }`

    子组件注入对象， 值为一个字符串数组或者一个对象(key为当前组件绑定名, value为父组件provide的值), 注入后子组件将不能再声明与注入对象相同名称的对象，子组件可以直接在组件内使用this.xxx进行调用

exp:
+ 父组件
```
var parent = {
	provide: {
		foo: 'test'
	}
}
```
+ 子组件
```
var children = {
	inject: ['foo']
	created() {
		console.log(this.foo)  // 'test'
	}
}
```

### $on / $emit
