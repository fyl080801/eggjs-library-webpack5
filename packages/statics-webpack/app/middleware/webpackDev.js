'use strict'

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const k2c = require('koa2-connect')
const { compose } = require('compose-middleware')

const getMiddleware = async (options) => {
  const { config, hotClient } = options

  const compiler = webpack({
    ...config,
    devServer: { hot: false, client: false },
  })

  options.output = compiler.options.output

  const additionalEntries = [
    `${require.resolve('webpack-hot-middleware/client')}`,
  ]

  for (const comp of [].concat(compiler.compilers || compiler)) {
    comp.hooks.make.tapPromise('@egglib/webpack', (compilation) => {
      return Promise.all(
        additionalEntries.map((entry) => {
          return new Promise((resolve, reject) => {
            compilation.addEntry(
              comp.context,
              webpack.EntryPlugin.createDependency(entry, {}),
              {},
              (err) => {
                if (err) return reject(err)
                resolve()
              },
            )
          })
        }),
      )
    })

    new webpack.HotModuleReplacementPlugin({}).apply(comp)
  }

  const hot = webpackHotMiddleware(compiler, hotClient || {})

  const dev = webpackDevMiddleware(compiler, {})

  return k2c(compose([dev, hot]))
}

module.exports = (_, app) => {
  Object.keys(app.webpackConfigs).forEach((key) => {
    app.webpackServices[key] = getMiddleware(app.webpackConfigs[key], app)
  })

  return async (ctx, next) => {
    const matched =
      app.webpackServices[app.matchStatic(ctx, app.webpackConfigs)]

    return (matched && (await matched)(ctx, next)) || next()
  }
}
