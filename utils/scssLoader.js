const rule = require('./rule')
const findRule = rule.findRule
const scssLoader = webpackConfig => {
  const cmlFile = findRule('.cml', webpackConfig)
  if (cmlFile) {
    cmlFile.rule.use = cmlFile.rule.use.map(use => {
      use.options.loaders.scss = JSON.parse(JSON.stringify(use.options.loaders.less)).map(item => {
        if (item.loader === 'less-loader') item.loader = 'sass-loader'
        return item
      })
      return use
    })
    webpackConfig.module.rules[cmlFile.index] = cmlFile.rule
  }
}
module.exports = scssLoader
