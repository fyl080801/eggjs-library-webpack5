'use strict'

const path = require('path')

const CliService = require('@vue/cli-service')

const service = new CliService(process.cwd())

service.init(process.env.NODE_ENV)

const { name } = require('../package.json')

exports.statics = {
  default: name,
  clients: {
    [name]: {
      dev: true,
      config: service.resolveWebpackConfig(),
    },
  },
  env: {},
}
