# 前端基础
---

## New()

```javascript
function Foo(name) {
	this.name = name
}
// 表面
const a = new Foo()
// 实际执行
const b = new Object() // 新建一个新对象
c.__proto__ = Foo.protptype // 继承原型
Foo.call(C) // 改变this指向
```

## 继承及原型链

每个实例对象(**object**) 都有一个私有属性(`__proto__`)指向它的构造函数的原型对象(**prototype**),  该原型对象(**prototype**)也有自己的私有属性(`__proto__`),就这样一层层向上直到一个对象的原型对象为`null`
```javascript
const a = {}
console.log(a.__proto__) // 即Object.prototype
/*
constructor: ƒ Object()
hasOwnProperty: ƒ hasOwnProperty()
isPrototypeOf: ƒ isPrototypeOf()
propertyIsEnumerable: ƒ propertyIsEnumerable()
toLocaleString: ƒ toLocaleString()
toString: ƒ toString()
valueOf: ƒ valueOf()
__defineGetter__: ƒ __defineGetter__()
__defineSetter__: ƒ __defineSetter__()
__lookupGetter__: ƒ __lookupGetter__()
__lookupSetter__: ƒ __lookupSetter__()
get __proto__: ƒ __proto__()
set __proto__: ƒ __proto__()
*/
console.log(a.__proto__.__proto__)
// null
```


### 创建对象的几种方式
```javascript
const a = {}
const b = new Object  // 或 new Object()
const c = Object.create({}) // Object.create(null) 没有原型的对象
const d = object.assign({})
```

### 继承对象的几种方式

1. 基于原型链的继承
	父类的原型改动会影响到所有之类
	
   ```javascript
   let Foo = function() {
       this.name = 'Foo'
   }
   
   let A = function() {}
   A.prototype = new Foo
   let a = new A
   console.log(a.name) 				// "Foo"
   console.log(a instanceof A)		// true
   console.log(a instanceof Foo)	// true
   Foo.prototype.demo = 1
   console.log(a.demo)				// 1
   ```
   
2. 基于构造函数的继承
	只继承了父类的初始定义, 父类后续原型改动不会影响到子类
	```javascript
	let Foo = function() {
		this.name = 'Foo'
	}
	let A = function() {
		Foo.call(this)
		this.age = 'A'
	}
	let a = new A
	console.log(a.name) 			// "Foo"
	console.log(a instanceof A) 	// true
	console.log(a instanceof Foo) 	// false
	Foo.prototype.demo = 1
	console.log(a.demo)				// undefined
	```
3. 寄生组合继承
	```javascript
	let Foo = function() {
		this.name = 'Foo'
	}
	
	let A = function() {
		Foo.call(this)
		this.age = 'A'
	}
	
	(function() {
		let temp = function(){}
		temp.prototype = Foo.prototype
		A.prototype = new temp()
		A.prototype.constructor = Foo
	})()
	
	
	```
