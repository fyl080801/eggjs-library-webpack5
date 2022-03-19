'use strict'

const webpack = require('webpack')

const webpackDevMiddleware = require('webpack-dev-middleware')
const hotClient = require('webpack-hot-middleware')
const k2c = require('koa2-connect')
// const DevServer = require('webpack-dev-server')

const getMiddleware = async (options) => {
  const compiler = webpack(options.config)

  options.output = compiler.options.output

  // const hotEntry = require.resolve('webpack/hot/dev-server')
  // const clientEntry = require.resolve('webpack-dev-server/client')

  const additionalEntries = [require.resolve('webpack-hot-middleware/client')]

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

    new webpack.HotModuleReplacementPlugin().apply(comp)
  }

  const devMiddleware = webpackDevMiddleware(compiler, {})

  const hot = hotClient(compiler, {})
  // const devServer = new DevServer({}, compiler)

  return (context, next) => {
    const ready = new Promise((resolve, reject) => {
      for (const comp of [].concat(compiler.compilers || compiler)) {
        comp.hooks.failed.tap('@egglib/webpack', (error) => {
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
        () => {
          k2c(hot)(context, () => {
            resolve(next())
          })
        },
      )
    })

    return Promise.all([ready, init])
  }
}

module.exports = (_, app) => {
  Object.keys(app.webpackConfigs).forEach((key) => {
    app.webpackServices[key] = getMiddleware(app.webpackConfigs[key])
  })

  return async (ctx, next) => {
    const matched =
      app.webpackServices[app.matchStatic(ctx, app.webpackConfigs)]

    return (matched && (await matched)(ctx, next)) || next()
  }
}
