class WxAddPluginComponents {
  constructor(options = {}) {
    this.options = options
    this.appJsonPath = 'app.json'
  }
  // 获取app.json配置
  getAppJson(compilation) {
    const appJsonContent = compilation.assets[this.appJsonPath].source()
    const appJson = JSON.parse(appJsonContent)
    return appJson
  }
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const appJson = this.getAppJson(compilation)
      // 将插件设置为全局组件
      Object.keys(this.options).forEach(key => {
        appJson.usingComponents[key] = this.options[key]
      })
      // 保存app.json
      const appJsonContent = JSON.stringify(appJson)
      compilation.assets[this.appJsonPath] = {
        source() {
          return appJsonContent
        },
        size() {
          return appJsonContent.length
        }
      }
      return callback()
    })
  }
}
module.exports = WxAddPluginComponents
