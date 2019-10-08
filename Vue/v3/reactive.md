# 响应式实现

> vue-next packages > reactivity > src > reactive.ts

## 变量定义

> WeakMap中的key是弱引用的, key不可枚举, 便于垃圾回收.
> 其中key只可以为对象的引用,当所引用对象未被使用或者被回收时map中键值对也会被回收
> WeakSet中的值也是弱引用, 处理方式类似于WeakMap

```typescript
// 源码
// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
export type Dep = Set<ReactiveEffect>
export type KeyToDepMap = Map<string | symbol, Dep>
export const targetMap = new WeakMap<any, KeyToDepMap>() // 响应式对象与其影响的映射

// WeakMaps that store {raw <-> observed} pairs.
const rawToReactive = new WeakMap<any, any>() // 未处理数据与对应响应式数据
const reactiveToRaw = new WeakMap<any, any>() // 响应式数据与对应未处理数据
const rawToReadonly = new WeakMap<any, any>() // 未处理数据与对应只读数据
const readonlyToRaw = new WeakMap<any, any>() // 只读数据与对应未处理数据

// WeakSets for values that are marked readonly or non-reactive during
// observable creation.
const readonlyValues = new WeakSet<any>()    // 只读数据集合
const nonReactiveValues = new WeakSet<any>() // 无需转成响应式的数据集合

// 集合类型Set, Map, WeakMap, WeakSet
const collectionTypes = new Set<Function>([Set, Map, WeakMap, WeakSet])
// 可观测数据正则, 匹配 Object|Array|Map|Set|WeakMap|WeakSet
const observableValueRE = /^\[object (?:Object|Array|Map|Set|WeakMap|WeakSet)\]$/
```

## 实现响应式方法

```typescript
// 源码
// 实现数据监听方法
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  // 如果目标(target)是实际对象的只读代理对象, 那么返回该代理对象
  if (readonlyToRaw.has(target)) {
    return target
  }
  // target is explicitly marked as readonly by user
  // 如果目标(target)是用户直接标记为只读的, 返回readonly的返回值
  if (readonlyValues.has(target)) {
    return readonly(target)
  }
  return createReactiveObject(
    target,
    rawToReactive,
    reactiveToRaw,
    mutableHandlers,
    mutableCollectionHandlers
  )
}

export function readonly(target: object) {
  // value is a mutable observable, retrieve its original and return
  // a readonly version.
  // 如果目标(target)是一个可变的观测对象, 检索reactiveToRaw集合
  // 如果找到目标(target)的原始定义对象就使用原始对象调用createReactiveObject方法
  if (reactiveToRaw.has(target)) {
    target = reactiveToRaw.get(target)
  }
  return createReactiveObject(
    target,
    rawToReadonly,
    readonlyToRaw,
    readonlyHandlers,
    readonlyCollectionHandlers
  )
}


function createReactiveObject(
  target: any,
  toProxy: WeakMap<any, any>,
  toRaw: WeakMap<any, any>,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  // 如果target不是对象, 直接返回target
  // 在开发环境下会显示警告
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // target already has corresponding Proxy.
  // 如果target已经有相对应的代理对象, 直接返回对应代理对象
  let observed = toProxy.get(target)
  if (observed !== void 0) {
    return observed
  }
  // target is already a Proxy
  // 如果target本身是代理对象, 直接返回target
  if (toRaw.has(target)) {
    return target
  }
  // only a whitelist of value types can be observed.
  // 如果target不可观测, 直接返回
  if (!canObserve(target)) {
    return target
  }
  // 如果target是集合类型, 则使用collectionHandlers来处理, 否则使用baseHandlers进行处理
  const handlers = collectionTypes.has(target.constructor)
    ? collectionHandlers
    : baseHandlers
  // 返回值, 使用ES6的Proxy对target进行代理, 代理函数为上方判断结果的handlers
  observed = new Proxy(target, handlers)
  // 将原始值与被观测值存入全局变量
  toProxy.set(target, observed)
  toRaw.set(observed, target)
  // 如果target没有对应KeyToDepMap, 则初始化Map
  if (!targetMap.has(target)) {
    targetMap.set(target, new Map())
  }
  // 返回响应式对象
  return observed
}

// 判断值是否是可观测对象, 值需要同时满足的条件如下:
// 不是Vue Component
// 不是虚拟DOM
// 通过'可观测对象正则'校验
// 不存在于'无需观测集合'中
const canObserve = (value: any): boolean => {
  return (
    !value._isVue &&
    !value._isVNode &&
    observableValueRE.test(toTypeString(value)) &&
    !nonReactiveValues.has(value)
  )
}
```

## Handlers

+ Handlers

```typescript
// baseHandlers
export const mutableHandlers: ProxyHandler<any> = {
  get: createGetter(false),
  set,
  deleteProperty,
  has,
  ownKeys
}
// readonlyHandlers
export const readonlyHandlers: ProxyHandler<any> = {
  get: createGetter(true),
  set(target: any, key: string | symbol, value: any, receiver: any): boolean {
    if (LOCKED) {
      if (__DEV__) {
        console.warn(
          `Set operation on key "${String(key)}" failed: target is readonly.`,
          target
        )
      }
      return true
    } else {
      return set(target, key, value, receiver)
    }
  },
  deleteProperty(target: any, key: string | symbol): boolean {
    if (LOCKED) {
      if (__DEV__) {
        console.warn(
          `Delete operation on key "${String(
            key
          )}" failed: target is readonly.`,
          target
        )
      }
      return true
    } else {
      return deleteProperty(target, key)
    }
  },
  has,
  ownKeys
}
```

+ Getter

> packages > reactivity > src > baseHandlers.ts

```typescript
const builtInSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(key => (Symbol as any)[key])
    .filter(value => typeof value === 'symbol')
)
/*
builtInSymbols内容
[[Entries]]
0:
value: Symbol(Symbol.asyncIterator)
1:
value: Symbol(Symbol.hasInstance)
2:
value: Symbol(Symbol.isConcatSpreadable)
3:
value: Symbol(Symbol.iterator)
4:
value: Symbol(Symbol.match)
5:
value: Symbol(Symbol.matchAll)
6:
value: Symbol(Symbol.replace)
7:
value: Symbol(Symbol.search)
8:
value: Symbol(Symbol.species)
9:
value: Symbol(Symbol.split)
10:
value: Symbol(Symbol.toPrimitive)
11:
value: Symbol(Symbol.toStringTag)
12:
value: Symbol(Symbol.unscopables)
size: 13
*/

function createGetter(isReadonly: boolean) {
  return function get(target: any, key: string | symbol, receiver: any) {
    const res = Reflect.get(target, key, receiver) // 取得目标对象key对应的值
    // 如果key为Symbol类型, 并且存在于内置Symbols集合中, 直接返回res
    if (typeof key === 'symbol' && builtInSymbols.has(key)) {
      return res
    }
    // 如果值是ref, 即 res[Symbol(__DEV__ ? 'refSymbol' : undefined)] === true
    if (isRef(res)) {
      return res.value
    }
    // 跟踪目标值
    track(target, OperationTypes.GET, key)
    return isObject(res)
      ? isReadonly
        ? // need to lazy access readonly and reactive here to avoid
          // circular dependency
          readonly(res)
        : reactive(res)
      : res
  }
}
```

## Effect

> packages > reactivity > src > effect.ts

```typescript
// 此处传入的key为要获取对象的属性名
export function track(
  target: any,
  type: OperationTypes,
  key?: string | symbol
) {
  // 在所有的钩子(hooks)过程中shouldTrack会置为false
  if (!shouldTrack) {
    return
  }
  // 取出最后一个放入响应式影响数组中的数据
  const effect = activeReactiveEffectStack[activeReactiveEffectStack.length - 1]
  // 如果effect有值
  if (effect) {
    if (type === OperationTypes.ITERATE) {
      key = ITERATE_KEY // Symbol('iterate')
    }
    // 找到该对象对应的响应式影响map(KeyToDepMap)
    let depsMap = targetMap.get(target)
    if (depsMap === void 0) {
      targetMap.set(target, (depsMap = new Map()))
    }
    // 根据对象属性(key)找到对应的依赖
    let dep = depsMap.get(key!) // !为解释这里key一定有值, 因为参数key为可选,默认解析为undefined,此处会报错.
    // 如果该属性没有对应依赖,则初始化依赖
    if (dep === void 0) {
      depsMap.set(key!, (dep = new Set()))
    }
    // 如果影响键值对中还未有该影响
    if (!dep.has(effect)) {
      // 订阅该影响
      dep.add(effect)
      // 影响栈订阅依赖
      effect.deps.push(dep)
      // 如果是开发环境并且有跟踪回调事件
      if (__DEV__ && effect.onTrack) {
        effect.onTrack({
          effect,
          target,
          type,
          key
        })
      }
    }
  }
}
```

## 暴露出的其他方法

> 这些方法实质就是在操作全集变量定义好的集合

```typescript
// 判断值是否是响应式的
export function isReactive(value: any): boolean {
  return reactiveToRaw.has(value) || readonlyToRaw.has(value)
}
// 判断值是否是只读的
export function isReadonly(value: any): boolean {
  return readonlyToRaw.has(value)
}
// 将响应式对象转换成原始对象
export function toRaw<T>(observed: T): T {
  return reactiveToRaw.get(observed) || readonlyToRaw.get(observed) || observed
}
// 将值标记为只读
export function markReadonly<T>(value: T): T {
  readonlyValues.add(value)
  return value
}
// 将值标记为无需响应式监听
export function markNonReactive<T>(value: T): T {
  nonReactiveValues.add(value)
  return value
}
```
