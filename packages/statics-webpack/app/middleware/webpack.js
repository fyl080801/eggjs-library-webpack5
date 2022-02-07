const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')

const defaults = { devMiddleware: {}, hotClient: {} }

const getMiddleware = (compiler, devMiddleware) => {
  return (context, next) => {
    // wait for webpack-dev-middleware to signal that the build is ready
    const ready = new Promise((resolve, reject) => {
      for (const comp of [].concat(compiler.compilers || compiler)) {
        comp.hooks.failed.tap('KoaWebpack', (error) => {
          reject(error)
        })
      }

      devMiddleware.waitUntilValid(() => {
        resolve(true)
      })
    })
    // tell webpack-dev-middleware to handle the request
    const init = new Promise((resolve) => {
      devMiddleware(
        context.req,
        {
          end: (content) => {
            // eslint-disable-next-line no-param-reassign
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
}

module.exports = (options, app) => {
  const ops = Object.assign({}, defaults, options)

  const compiler = webpack({
    mode: 'development',
    
  })

  const devMiddleware = webpackDevMiddleware(compiler)
  const middleware = getMiddleware(compiler, devMiddleware)

  return middleware
}
