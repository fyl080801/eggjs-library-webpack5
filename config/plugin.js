module.exports = {
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
  RequestCurl: {
    enable: !!process.env.curl,
    package: 'egg-request-curl',
  },
  '@egglib/statics': {
    enable: true,
    package: '@egglib/statics-webpack',
  },
  '@egglib/sample-dev': {
    enable: true,
  },
}
