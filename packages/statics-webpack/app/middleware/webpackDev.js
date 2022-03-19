'use strict'

const webpack = require('webpack')
const k2c = require('koa2-connect')
const DevServer = require('webpack-dev-server')

const defaultDevServer = {
  allowedHosts: 'all',
}

const getClient = (config, compiler) => {
  const devServerConfig = Object.assign(defaultDevServer, config || {})

  return new Promise((resolve) => {
    const server = new DevServer(devServerConfig, compiler)

    server.start().then(() => {
      resolve(server)
    })
  })
}

const getMiddleware = async (options) => {
  const compiler = webpack(options.config)

  options.output = compiler.options.output

  const hotClient = await getClient(options.devServer, compiler)

  return k2c(hotClient.middleware)
}

module.exports = (options, app) => {
  Object.keys(app.webpackConfigs).forEach((key) => {
    app.webpackServices[key] = getMiddleware(app.webpackConfigs[key])
  })

  return async (ctx, next) => {
    const matched =
      app.webpackServices[app.matchStatic(ctx, app.webpackConfigs)]

    return (matched && (await matched)(ctx, next)) || next()
  }
}
