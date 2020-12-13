## Module

## import VS Require

import 在编译时进行处理
require 为运行时动态加载, 为同步加载
import() 为动态加载, 返回Promise对象, 为异步加载.

当import()加载模块成功后,  该模块会作为then的response参数, 默认输出模块的default输出接口.

同时加载多个模块可以用

```js
Promise.all([im1(), im2(), im3()]).then(([re1, re2, re3]) => {})
```

## export

CommonJS module.export 是对值的拷贝, 只有在脚本运行时才会完成
ES6 export 是一种静态定义, 是在静态编译阶段就会完成的

