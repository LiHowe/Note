# Compiler
> Vue将编译器命名为baseCompile, 为了更高权重的编译器在re-exporting的时候可以export compile

## Core
> packages -> compiler-core -> src -> index.ts
> 用于实现自定义编译器

```typescript
export function baseCompile(
    template: string | RootNode,
    options: CompilerOptions = {}
): CodegenResult {
    // 定义抽象语法树, 如果是字符串模板的话就转换, 不然就直接为RootNode
    const ast = isString(template) ? parse(template, options) : template
    // 前置识别器标识, 如果不在浏览器中并且options中的flag为true或者mode为module
    const prefixIdentifiers =
        !__BROWSER__ &&
        (options.prefixIdentifiers === true || options.mode === 'module')
    // transform 方法位于同文件夹下transform.ts中
    // 该方法调用了同文件下的
    // 1. createTransformContext(root, options)
    // 2. traverseNode(root, options) 
    transform(ast, {
        ...options,
        prefixIdentifiers,
        nodeTransforms: [
          transformIf,
          transformFor,
          ...(prefixIdentifiers
            ? [
                // order is important
                trackVForSlotScopes,
                transformExpression
              ]
            : []),
          trackSlotScopes,
          transformSlotOutlet,
          transformElement,
          optimizeText,
          ...(options.nodeTransforms || []) // user transforms
        ],
        directiveTransforms: {
          on: transformOn,
          bind: transformBind,
          once: transformOnce,
          model: transformModel,
          ...(options.directiveTransforms || {}) // user transforms
        }
      })
      return generate(ast, {
        ...options,
        prefixIdentifiers
      })
}
```

### transform
> 转换节点
```typescript
export function transform(root: RootNode, options: TransformOptions) {
  const context = createTransformContext(root, options)
  traverseNode(root, context)
  // 如果需要提升为静态(Static)
  if (options.hoistStatic) {
    hoistStatic(root, context)
  }
  finalizeRoot(root, context)
}

```

### hoistStatic
> compiler-core -> src -> transforms -> hoistStatic.ts
> 将节点提升为静态节点
> 
```typescript
export function hoistStatic(root: RootNode, context: TransformContext) {
  walk(
    root.children, // 子节点模板数组
    context, // 转换内容
    new Map(), // 结果缓存
    isSingleElementRoot(root, root.children[0]) // 是否为不需要提升的节点
  )
}
```

### generate
>
```typescript
export function generate(
  ast: RootNode,
  options: CodegenOptions = {}
): CodegenResult {
  const context = createCodegenContext(ast, options)
  const {
    mode,
    push,
    helper,
    prefixIdentifiers,
    indent,
    deindent,
    newline
  } = context
  const hasHelpers = ast.helpers.length > 0
  const useWithBlock = !prefixIdentifiers && mode !== 'module'

  // preambles
  if (mode === 'function') {
    // Generate const declaration for helpers
    // In prefix mode, we place the const declaration at top so it's done
    // only once; But if we not prefixing, we place the declaration inside the
    // with block so it doesn't incur the `in` check cost for every helper access.
    if (hasHelpers) {
      if (prefixIdentifiers) {
        push(`const { ${ast.helpers.map(helper).join(', ')} } = Vue\n`)
      } else {
        // "with" mode.
        // save Vue in a separate variable to avoid collision
        push(`const _Vue = Vue\n`)
        // in "with" mode, helpers are declared inside the with block to avoid
        // has check cost, but hoists are lifted out of the function - we need
        // to provide the helper here.
        if (ast.hoists.length) {
          push(`const _${helperNameMap[CREATE_VNODE]} = Vue.createVNode\n`)
          if (ast.helpers.includes(COMMENT)) {
            push(`const _${helperNameMap[COMMENT]} = Vue.Comment\n`)
          }
        }
      }
    }
    genHoists(ast.hoists, context)
    newline()
    push(`return `)
  } else {
    // generate import statements for helpers
    if (hasHelpers) {
      push(`import { ${ast.helpers.map(helper).join(', ')} } from "vue"\n`)
    }
    genHoists(ast.hoists, context)
    newline()
    push(`export default `)
  }

  // enter render function
  push(`function render() {`)
  indent()

  if (useWithBlock) {
    push(`with (this) {`)
    indent()
    // function mode const declarations should be inside with block
    // also they should be renamed to avoid collision with user properties
    if (hasHelpers) {
      push(
        `const { ${ast.helpers
          .map(s => `${helperNameMap[s]}: _${helperNameMap[s]}`)
          .join(', ')} } = _Vue`
      )
      newline()
      newline()
    }
  } else {
    push(`const _ctx = this`)
    newline()
  }

  // generate asset resolution statements
  if (ast.components.length) {
    genAssets(ast.components, 'component', context)
  }
  if (ast.directives.length) {
    genAssets(ast.directives, 'directive', context)
  }
  if (ast.components.length || ast.directives.length) {
    newline()
  }

  // generate the VNode tree expression
  push(`return `)
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  } else {
    push(`null`)
  }

  if (useWithBlock) {
    deindent()
    push(`}`)
  }

  deindent()
  push(`}`)
  return {
    ast,
    code: context.code,
    map: context.map ? context.map.toJSON() : undefined
  }
}
```

### createTransformContext
> 初始化ast内容(属性), 提供了addId与removeId方法来进行id增减操作
```typescript
function createTransformContext(
  root: RootNode,
  {
    prefixIdentifiers = false,
    hoistStatic = false,
    nodeTransforms = [],
    directiveTransforms = {},
    onError = defaultOnError
  }: TransformOptions
): TransformContext {
  const context: TransformContext = {
    root, // 根标签
    helpers: new Set(), // 
    components: new Set(), // 组件
    directives: new Set(), // 指令
    hoists: [],
    identifiers: {},
    scopes: {
      vFor: 0,
      vSlot: 0,
      vPre: 0,
      vOnce: 0
    },
    prefixIdentifiers,
    hoistStatic,
    nodeTransforms,
    directiveTransforms,
    onError,
    parent: null,
    currentNode: root,
    childIndex: 0,
    helper(name) {
      context.helpers.add(name)
      return name
    },
    helperString(name) {
      return (
        (context.prefixIdentifiers ? `` : `_`) +
        helperNameMap[context.helper(name)]
      )
    },
    replaceNode(node) {
      /* istanbul ignore if */
      if (__DEV__) {
        if (!context.currentNode) {
          throw new Error(`Node being replaced is already removed.`)
        }
        if (!context.parent) {
          throw new Error(`Cannot replace root node.`)
        }
      }
      context.parent!.children[context.childIndex] = context.currentNode = node
    },
    removeNode(node) {
      if (__DEV__ && !context.parent) {
        throw new Error(`Cannot remove root node.`)
      }
      const list = context.parent!.children
      const removalIndex = node
        ? list.indexOf(node)
        : context.currentNode
          ? context.childIndex
          : -1
      /* istanbul ignore if */
      if (__DEV__ && removalIndex < 0) {
        throw new Error(`node being removed is not a child of current parent`)
      }
      if (!node || node === context.currentNode) {
        // current node removed
        context.currentNode = null
        context.onNodeRemoved()
      } else {
        // sibling node removed
        if (context.childIndex > removalIndex) {
          context.childIndex--
          context.onNodeRemoved()
        }
      }
      context.parent!.children.splice(removalIndex, 1)
    },
    onNodeRemoved: () => {},
    addIdentifiers(exp) {
      // identifier tracking only happens in non-browser builds.
      if (!__BROWSER__) {
        if (isString(exp)) {
          addId(exp)
        } else if (exp.identifiers) {
          exp.identifiers.forEach(addId)
        } else if (exp.type === NodeTypes.SIMPLE_EXPRESSION) {
          addId(exp.content)
        }
      }
    },
    removeIdentifiers(exp) {
      if (!__BROWSER__) {
        if (isString(exp)) {
          removeId(exp)
        } else if (exp.identifiers) {
          exp.identifiers.forEach(removeId)
        } else if (exp.type === NodeTypes.SIMPLE_EXPRESSION) {
          removeId(exp.content)
        }
      }
    },
    hoist(exp) {
      context.hoists.push(exp)
      return createSimpleExpression(
        `_hoisted_${context.hoists.length}`,
        false,
        exp.loc
      )
    }
  }

  function addId(id: string) {
    const { identifiers } = context
    if (identifiers[id] === undefined) {
      identifiers[id] = 0
    }
    identifiers[id]!++
  }

  function removeId(id: string) {
    context.identifiers[id]!--
  }

  return context
}
```

### traverseNode
> 遍历Node
```typescript
export function traverseNode(
  node: RootNode | TemplateChildNode,
  context: TransformContext
) {
  // apply transform plugins
  const { nodeTransforms } = context
  // 定义退出方法
  const exitFns = []
  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      if (isArray(onExit)) {
        exitFns.push(...onExit)
      } else {
        exitFns.push(onExit)
      }
    }
    if (!context.currentNode) {
      // node was removed
      return
    } else {
      // node may have been replaced
      node = context.currentNode
    }
  }
  // 根据Node的类型进行不同处理
  switch (node.type) {
    // 注释类型
    case NodeTypes.COMMENT:
      // inject import for the Comment symbol, which is needed for creating
      // comment nodes with `createVNode`
      // 使用createVNode创建注释节点需要为Comment symbol 注入引用
      context.helper(CREATE_VNODE)
      context.helper(COMMENT)
      break
    // 改写类型
    case NodeTypes.INTERPOLATION:
      // no need to traverse, but we need to inject toString helper
      context.helper(TO_STRING)
      break

    // for container types, further traverse downwards
    // if类型, 判断if分支长度并依次分别向下遍历
    case NodeTypes.IF:
      for (let i = 0; i < node.branches.length; i++) {
        traverseChildren(node.branches[i], context)
      }
      break
    // 元素类型, for循环类型, 根节点类型 都进一步向下遍历
    case NodeTypes.FOR:
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      traverseChildren(node, context)
      break
  }

  // exit transforms
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}
```

### finalizeRoot
> 完成根节点
```typescript
function finalizeRoot(root: RootNode, context: TransformContext) {
  const { helper } = context
  const { children } = root
  const child = children[0]
  if (children.length === 1) {
    // if the single child is an element, turn it into a block.
    if (isSingleElementRoot(root, child) && child.codegenNode) {
      // single element root is never hoisted so codegenNode will never be
      // SimpleExpressionNode
      const codegenNode = child.codegenNode as
        | ElementCodegenNode
        | ComponentCodegenNode
      if (codegenNode.callee === APPLY_DIRECTIVES) {
        codegenNode.arguments[0].callee = helper(CREATE_BLOCK)
      } else {
        codegenNode.callee = helper(CREATE_BLOCK)
      }
      root.codegenNode = createBlockExpression(codegenNode, context)
    } else {
      // - single <slot/>, IfNode, ForNode: already blocks.
      // - single text node: always patched.
      // root codegen falls through via genNode()
      root.codegenNode = child
    }
  } else if (children.length > 1) {
    // root has multiple nodes - return a fragment block.
    root.codegenNode = createBlockExpression(
      createCallExpression(helper(CREATE_BLOCK), [
        helper(FRAGMENT),
        `null`,
        root.children
      ]),
      context
    )
  } else {
    // no children = noop. codegen will return null.
  }
  // finalize meta information
  root.helpers = [...context.helpers]
  root.components = [...context.components]
  root.directives = [...context.directives]
  root.hoists = context.hoists
}
```

## DOM
> packages -> compiler-dom -> src -> index.ts
