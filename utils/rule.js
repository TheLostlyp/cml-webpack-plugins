module.exports = {
  findRule(test, webpackConfig) {
    let rules
    webpackConfig.module.rules.some((item, index) => {
      if (new RegExp(item.test).test(test)) {
        rules = {
          rule: item,
          index
        }
        return true
      }
    })
    return rules
  }
}
