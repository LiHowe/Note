import AuthenticationContext from './adal'
/**
 * adal for Vue.js
 * @author zihao.he
 * @since 2018/10/11 16:44:53
 */
export default {
  // 实例
  authenticationContext: null,
  // 配置项
  config: null,
  // 初始化方法
  initialize(config) {
    // 注入配置实例化
    this.authenticationContext = new AuthenticationContext(config)
    window.AuthenticationContext = AuthenticationContext
    this.config = config
    return new Promise((resolve, reject) => {
      if (this.authenticationContext.isCallback(window.location.hash) || window.self !== window.top) {
        this.authenticationContext.handleWindowCallback()
      } else {
        const user = this.authenticationContext.getCachedUser()
        if (user) {
          console.log(user)
          resolve()
        } else {
          this.signIn()
        }
      }
    })
  },
  // 获取token
  acquireToken() {
    return new Promise((resolve, reject) => {
      this.authenticationContext.acquireToken(this.config.clientId, (error, token) => {
        if (error || !token) {
          return reject(error)
        } else {
          return resolve(token)
        }
      })
    })
  },
  // 获取token重定向
  acquireTokenRedirect() {
    this.authenticationContext.acquireTokenRedirect(this.config.redirect_uri)
  },
  getCachedUser() {
    return this.authenticationContext.getCachedUser()
  },
  // 是否验证过
  isAuthenticated() {
    return !!this.authenticationContext.getCachedToken(this.config.clientId)
  },
  // 获取用户配置文件
  getUserProfile() {
    return this.authenticationContext.getCachedUser().profile
  },
  // 登录
  signIn() {
    this.authenticationContext.login()
  },
  // 登出
  signOut() {
    this.authenticationContext.logOut()
  }
}
