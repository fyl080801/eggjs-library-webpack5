'use strict'

const path = require('path')

const CliService = require('@vue/cli-service')

const service = new CliService(path.resolve(process.cwd(), 'packages/w5test'))

service.init(process.env.NODE_ENV)

exports.statics = {
  default: '@egglib/w5test',
  clients: {
    '@egglib/w5test': {
      dev: true,
      config: {
        config: service.resolveWebpackConfig(),
        devMiddleware: {},
      },
    },
  },
  env: {},
}
