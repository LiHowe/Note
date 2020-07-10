# ESO -- Azure AD, ADA(active directory authentication)

ADAL: https://github.com/AzureAD/azure-activedirectory-library-for-js/blob/dev/lib/adal.js

<font color="red">申请时请确保redirect URL后面以反斜杠 (/)结尾, 不然可能导致safari环境下重定向token信息缺失。</font>

**配置**
```js
var esoConfig = {
  authorizationUrl: 'auth path',
  clientId: 'your client id',
  redirect_uri:'your callback url',
  scope: 'user_profile openid',
  cacheLocation: 'localStorage', // 或者sessionStorage
  response_type: 'id_token token',
  state: 1,
  nonce: 1
}
```

重要方法(adal-vue.js)
1. acquireToken()
    用于获取验证后的token，并且在token过期前(默认120s)对token进行renew，确保用户不会在使用过程中token过期导致系统操作中断。
2. signIn()
    登录方法，会将当前页面重定向到authorizationUrl进行验证
3. signOut()
    登出方法，会清空验证信息，并将当前页面重定向到登出页
4. initialize()
    初始化方法, 传入用户配置进行程序初始化

在Vue使用中需要在路由拦截器以及请求拦截器中调用acquireToken()进行token获取与过期验证,并将该token放置在header中/cookie中传给后台进行二次验证,确保token有效性。

adal在token失效但是id_token没有失效的情况下会创建一个iframe来‘隐式’调用验证网站进行token获取/renew
