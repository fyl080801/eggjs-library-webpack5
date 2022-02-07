module.exports = (appInfo) => {
  const config = (exports = {})

  config.keys = appInfo.name + '_1556156913732_2632'

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  }

  return config
}
