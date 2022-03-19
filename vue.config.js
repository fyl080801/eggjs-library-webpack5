const { name } = require('./package.json')
const path = require('path')
const { defineConfig } = require('@vue/cli-service')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = defineConfig({
  publicPath: `/${name}/`,
  assetsDir: 'static',
  outputDir: 'dist',
  lintOnSave: true,
  // parallel: false, // pinia need
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src'),
      },
    },
    devtool: process.env.NODE_ENV === 'development' ? 'source-map' : undefined,
    performance: {
      hints: false,
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
        // { parser: { system: false } },
      ],
    },
  },
  // pluginOptions: {
  //   windicss: {
  //     configFiles: [resolve('windi.config.js')],
  //   },
  // },
  // chainWebpack(config) {
  //   config.plugins.delete('preload')
  //   config.plugins.delete('prefetch')

  //   // babel 因为服务是从server启动的，这里手动加载babel config
  //   config.module
  //     .rule('compile')
  //     .test(/\.js$/)
  //     .include.add(resolve('src'))
  //     .end()
  //     .use('babel')
  //     .loader('babel-loader')
  //     .options(require('./babel.config'))
  //     .end()

  //   // set svg-sprite-loader
  //   config.module.rule('svg').exclude.add(resolve('src/icons')).end()
  //   config.module
  //     .rule('icons')
  //     .test(/\.svg$/)
  //     .include.add(resolve('src/icons'))
  //     .end()
  //     .use('svg-sprite-loader')
  //     .loader('svg-sprite-loader')
  //     .options({
  //       symbolId: 'icon-[name]',
  //     })
  //     .end()

  //   config.when(process.env.NODE_ENV === 'development', (config) => {
  //     config.devtool('cheap-source-map')
  //   })
  // },
})
