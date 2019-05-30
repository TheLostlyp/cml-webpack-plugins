class WxSubpackage {
  constructor() {
    this.appJsonPath = 'app.json'
  }
  // 获取app.json配置
  getAppJson(compilation) {
    const appJsonContent = compilation.assets[this.appJsonPath].source()
    const appJson = JSON.parse(appJsonContent)
    return appJson
  }
  // 编译app.json，分包的page无需在pages里声明
  jsonCompiler(compilation) {
    const appJson = this.getAppJson(compilation)
    const subPackages = appJson.subPackages
    const subPackagesPages = []
    subPackages.forEach(subPackage => {
      subPackage.pages.forEach(page => {
        subPackagesPages.push(`${subPackage.root}/${page}`)
      })
    })
    appJson.pages = appJson.pages.filter(item => {
      return subPackagesPages.indexOf(item) == -1
    })
    const appJsonContent = JSON.stringify(appJson)
    compilation.assets[this.appJsonPath] = {
      source() {
        return appJsonContent
      },
      size() {
        return appJsonContent.length
      }
    }
  }
  // js编译 借鉴https://github.com/didi/chameleon/issues/73
  jsCompiler(compilation) {
    const appJson = this.getAppJson(compilation)
    const roots = []
    appJson.subPackages.forEach(subPackage => {
      roots.push(subPackage.root)
    })
    Object.keys(compilation.assets).forEach(item => {
      const reg = new RegExp(`^(${roots.join('|')}).*\.js$`)
      if (reg.test(item)) {
        const prefix = `static/js/`
        const subPackageJsPath = `${prefix}${item}`
        let content = compilation.assets[item].source()
        content = content.replace(`require('../../../../${subPackageJsPath}')`, '')
        const subPackageJsContent = compilation.assets[subPackageJsPath].source()
        content += subPackageJsContent.replace(`var __CML__GLOBAL = require("../../../../manifest.js");`, '')
        delete compilation.assets[subPackageJsPath]
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
  }
  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      this.jsCompiler(compilation)
      this.jsonCompiler(compilation)
      return callback()
    })
  }
}
module.exports = WxSubpackage
