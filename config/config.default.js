/* eslint valid-jsdoc: "off" */

'use strict'

const fs = require('fs')
const path = require('path')

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  config.keys = appInfo.name + '_1647579079949_5785'

  config.development = {
    overrideDefault: true,
    overrideIgnore: false,
    watchDirs: ['app', 'config', 'app.js', 'agent.js', 'packages', 'pages'],
    ignoreDirs: [
      'node_modules',
      ...fs
        .readdirSync(path.resolve(process.cwd(), 'packages'))
        .map((dir) => `packages/${dir}/src`),
    ],
  }

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    },
  }

  config.middleware = []

  const userConfig = {}

  return {
    ...config,
    ...userConfig,
  }
}
