# Optimized Vue CLI config

## vue.config.js


```javascript
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const isProd = process.env.NODE_ENV === 'production'
module.exports = {
  configureWebpack: config => {
    // gzip
    if (isProd) {
      // 配置webpack 压缩
      config.plugins.push(
        new CompressionWebpackPlugin({
          test: /\.js$|\.html$|\.css$/,
          // 超过4kb压缩
          threshold: 1024 * 4
        })
      )
    }
  }
}
```

