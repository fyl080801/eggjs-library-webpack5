'use strict'

const { join } = require('path')
const root = require('app-root-path')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const k2c = require('koa2-connect')
const kc = require('koa-compose')
// const { compose } = require('compose-middleware')

const defaults = { devMiddleware: {}, hotClient: {} }

const createHotClient = (compiler, options) => {
  if (!options.hotClient) {
    return Promise.resolve(null)
  }

  return webpackHotMiddleware(compiler, options.hotClient)
}

const getMiddleware = async (opts) => {
  const options = Object.assign({}, defaults, opts)

  let { compiler, config } = options

  if (!compiler) {
    if (!config) {
      config = require(options.configPath ||
        join(root.path, 'webpack.config.js'))
    }

    compiler = webpack(config)
  }

  if (!options.devMiddleware.publicPath) {
    const { publicPath } = compiler.options.output

    if (!publicPath) {
      throw new Error(
        "@egglib/statics-webpack: publicPath must be set on `dev` options, or in a compiler's `output` configuration.",
      )
    }

    options.devMiddleware.publicPath = publicPath
    opts.output = compiler.options.output
  }

  const additionalEntries = [
    `${require.resolve('webpack-hot-middleware/client')}`,
  ]

  for (const comp of [].concat(compiler.compilers || compiler)) {
    comp.hooks.make.tapPromise('@egglib/statics-webpack', (compilation) => {
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

  const hotClient = createHotClient(compiler, options)

  const devMiddleware = webpackDevMiddleware(compiler, options.devMiddleware)

  const middleware = (context, next) => {
    const ready = new Promise((resolve, reject) => {
      for (const comp of [].concat(compiler.compilers || compiler)) {
        comp.hooks.failed.tap('@egglib/statics-webpack', (error) => {
          reject(error)
        })
      }

      devMiddleware.waitUntilValid(() => {
        resolve(true)
      })
    })

    const init = new Promise((resolve) => {
      devMiddleware(
        context.req,
        {
          end: (content) => {
            context.body = content
            resolve()
          },
          getHeader: context.get.bind(context),
          setHeader: context.set.bind(context),
          locals: context.state,
        },
        () => resolve(next()),
      )
    })

    return Promise.all([ready, init])
  }

  const close = (callback) => {
    const next = hotClient
      ? () => {
          hotClient.close()
          callback()
        }
      : callback
    devMiddleware.close(next)
  }

  return Object.assign(kc([middleware, k2c(hotClient)]), {
    hotClient,
    devMiddleware,
    close,
  })
}

module.exports = (_, app) => {
  Object.keys(app.webpackConfigs).forEach((key) => {
    app.webpackServices[key] = getMiddleware(app.webpackConfigs[key])
  })

  const map = {}

  return async (ctx, next) => {
    const matcher = app.matchStatic(ctx, app.webpackConfigs)

    if (!map[matcher]) {
      if (app.webpackServices[matcher]) {
        map[matcher] = await app.webpackServices[matcher]
      }
    }

    const matched = map[matcher]

    return (matched && matched(ctx, () => next())) || next()
  }
}
