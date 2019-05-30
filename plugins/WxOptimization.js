class WxOptimization {
  constructor() {
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
      Object.keys(compilation.assets).forEach(item => {
        const appJsonReg = new RegExp(`${this.appJsonPath}$`)
        // 过滤所有json配置，小程序已配置全局组件，其他地方无需引用
        if (/\.json$/.test(item) && !appJsonReg.test(item)) {
          let content = compilation.assets[item].source()
          const json = JSON.parse(content)
          if (!json.usingComponents) return
          const usingComponents = {}
          const jsonKeys = Object.keys(json.usingComponents)
          const appJsonKeys = Object.keys(appJson.usingComponents)
          jsonKeys.forEach(item => {
            if (appJsonKeys.indexOf(item) == -1) {
              usingComponents[item] = json.usingComponents[item]
            }
          })
          json.usingComponents = usingComponents
          content = JSON.stringify(json)
          compilation.assets[item] = {
            source() {
              return content
            },
            size() {
              return content.length
            }
          }
        }
      })
      return callback()
    })
  }
}
module.exports = WxOptimization
