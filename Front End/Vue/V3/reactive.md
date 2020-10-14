# Vue / reactivity

> 本笔记基于@vue/reactivity version: 3.0.0
>
> 该包是vue3实现数据响应式的



> src/reactive.ts

```typescript
export function reactive(target: object) {
  // if trying to observe a readonly proxy, return the readonly version.
  if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
    return target
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers, // baseHandlers.ts
    mutableCollectionHandlers // baseHandlers.ts
  )
}

function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  if (!isObject(target)) {
    if (__DEV__) {
      console.warn(`value cannot be made reactive: ${String(target)}`)
    }
    return target
  }
  // target is already a Proxy, return it.
  // exception: calling readonly() on a reactive object
  if (
    target[ReactiveFlags.RAW] &&
    !(isReadonly && target[ReactiveFlags.IS_REACTIVE])
  ) {
    return target
  }
  // target already has corresponding Proxy
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  // only a whitelist of value types can be observed.
  const targetType = getTargetType(target)
  if (targetType === TargetType.INVALID) {
    return target
  }
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}
```



> baseHandlers.ts

```typescript
// 可变对象处理
export const mutableHandlers: ProxyHandler<object> = {
  get, // 拦截对象读取属性操作[访问属性|访问原型链上的属性|Reflect.get()]
  set, // 拦截对象设置属性操作
  deleteProperty, // 拦截对对象属性delete操作
  has, // 拦截 in 操作符
  ownKeys // 拦截Reflect.ownKeys()
}

// handler get拦截对应处理, Proxy get对应文档 
//[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/get]
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) { // __v_isReactive
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) { // __v_isReadonly
      return isReadonly
    } else if (
      // __v_raw
      key === ReactiveFlags.RAW &&
      receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)
    ) {
      return target
    }
    const targetIsArray = isArray(target)
    // 如果对象是数组, 如果key在['includes', 'indexof', 'lastIndexOf']中
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      // 获取arrayInstrumentations key对应方法
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    // 获取对象key对应的值
    const res = Reflect.get(target, key, receiver)
	// 是否是对象内置属性
    const keyIsSymbol = isSymbol(key)
    if (
      keyIsSymbol
        ? builtInSymbols.has(key as symbol)
        : key === `__proto__` || key === `__v_isRef`
    ) {
      return res
    }
	// 如果不是只读对象
    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }
    // 如果是浅响应式的(根属性)
    if (shallow) {
      return res
    }
      
    if (isRef(res)) {
      // ref unwrapping - does not apply for Array + integer key.
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
      return shouldUnwrap ? res.value : res
    }

    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      // 将是object的返回值也转换为proxy. 
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}

```



> effect.ts

```typescript
export function track(target: object, type: TrackOpTypes, key: unknown) {
  // 如果不应该追踪 或者 没有影响则直接返回
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  // 获取依赖对照
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  // 获取key对应依赖
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  // 依赖是否有对应影响
  if (!dep.has(activeEffect)) {
    // 没有依赖则添加依赖
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}
```







> collectionHandlers.ts

```typescript
// 可变数组对象处理
export const mutableCollectionHandlers: ProxyHandler<CollectionTypes> = {
  get: createInstrumentationGetter(false, false)
}
```

