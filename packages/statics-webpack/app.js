'use strict'

const path = require('path')

module.exports = (app) => {
  const { clients = {} } = app.config.statics || {}

  if (Object.keys(clients).find((key) => clients[key].dev)) {
    const corsIndex = app.config.coreMiddleware.indexOf('cors')
    app.config.coreMiddleware.splice(corsIndex + 1, 0, 'webpackDev')
  }

  app.setProvider({
    setConfig({ name }) {
      const config =
        app.config.statics &&
        app.config.statics.clients &&
        app.config.statics.clients[name]

      if (config) {
        app.webpackConfigs[name] = config.config
      }
    },

    async viewInjector({ name, ctx, view }) {
      const config = app.webpackConfigs[name]

      const viewUrl = `${ctx.request.protocol}://${path.join(
        ctx.request.host,
        (config.devMiddleware || {}).publicPath,
        view,
      )}`

      const response = await ctx.curl(viewUrl, {
        method: 'GET',
        timeout: 500000,
        headers: {
          accept: 'text/html',
        },
      })

      return response.data.toString()
    },
  })
}
