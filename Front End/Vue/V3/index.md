# Vue-3

## 1. 多重V-model数据绑定

```vue
<template>
    <div>
        <span>{{ first }}, {{ last }}</span>
        <name-component v-model:first="first" v-model:last="last" />
    </div>
</template>
<script>
export default {
    components: {
        'name-component': () => {
            return {
                prpos: {
                    first: Stirng,
                    last: String
                },
                template: `
					<input type="text" :value="first" @input="$emit('update:first', $event.target.value)"></input>
					<input type="text" :value="last" @input="$emit('update:last', $event.target.value)"></input>
				`,
                data: () => ({
                    first: 'first',
                    last: 'last'
                })
            }
        }
    },
    data: () => ({
        first: 'first',
        last: 'last'
    })
}
</script>
```



## 2. 响应式实现方式变更

Object.definePropertity => Proxy



## 3. 组合组件API (Composition API)

> 方便进行组件之间的代码复用

### setup

+ 语法

  `setup(props, context)`

  `setup(props, { attrs, slots, emit })`

+ 生命周期

  | 组件生命周期    | setup 生命周期 (需要import from vue) |
  | --------------- | ------------------------------------ |
  | beforeCreate    | N/A                                  |
  | created         | N/A                                  |
  | beforeMount     | onBeforeMount                        |
  | mounted         | onMounted                            |
  | beforeUpdate    | onBeforeUpdate                       |
  | updated         | onUpdated                            |
  | beforeUnmount   | onBeforeUnmount                      |
  | unmounted       | onUnmounted                          |
  | errorCaptured   | onErrorCaptured                      |
  | renderTracked   | onRenderTracked                      |
  | renderTriggered | onRenderTriggered                    |

+ Provide/Inject

  在`setup`中使用`provide`和`inject`时, 需要先`import { provide, inject } from 'vue'` 

  + provide

    ```vue
    <template>
      <inject />
    </template>
    <script>
    import { provide, ref, reactive, readonly } from 'vue'
    import Inject from './Inject.vue'
    export default {
        components: { Inject },
        setup() {
            // 静态值提供
            provide('normalAttr', 'value1')
            provide('objectAttr', {
              key1: 'value1',
              key2: 'value2'
            })
            // 响应式值提供
            const normalAttr = ref('value')
            provide('reactiveNormalAttr', normalAttr)
            const objectAttr = reactive({
              key1: 'value1',
              key2: 'value2'
            })
            provide('reactiveObjectAttr', objectAttr)
            // 提供修改方法来修改响应式值
            provide('reactiveValueUpdateFn', (val) => {
              normalAttr.value = val
            })
            // 提供只读值, 只能通过提供者进行修改, 注入(inject)者无法修改
            provide('readonlyAttr', readonly(objectAttr))
        }
    }
    </script>
    ```

  + inject

    ```vue
    <script>
    import { inject } from 'vue'
    export default {
        setup() {
            const normalAttrWithDefaultValue = inject('normalAttr', 'defaultValue')
            const normalAttr = inject('normalAttr')
            const objectAttr = inject('objectAttr')
            
            const reactiveAttr = inject('reactiveNormalAttr')
            console.log('origin reactiveAttr:', reactiveAttr.value) // value
            const changeReactiveNormalAttrFn = inject('reactiveValueUpdateFn')
            changeReactiveNormalAttrFn('new value')
            console.log('changed reactiveAttr:', reactiveAttr.value) // new value
            
            const readonlyAttr = inject('readonlyAttr')
            console.log('origin readonlyAttr:', readonlyAttr.key1) // value1
            readonlyAttr.key1 = 'new value'
            console.log('readonlyAttr:', readonlyAttr.key1) // value1
        }
    }
    </script>
    ```

    

**注意**: 

1. `setup`在组件**beforeCreate**生命周期之前执行, 所以在`setup`方法中只能访问组件的`prop`, `attrs`,`slots`,`emit`

2. `props`属性不能直接解构使用, 会丢失响应性
3. `props`如果需要解构要使用`toRefs(props)`方法进行解构
4. 可以通过watchEffect监视`props`变化
5. `setup`方法返回的`ref`会自动解开, 在组件使用时不需要`.value`



---



### 模板引用

> https://vue-docs-next-zh-cn.netlify.app/guide/composition-api-template-refs.html#%E6%A8%A1%E6%9D%BF%E5%BC%95%E7%94%A8