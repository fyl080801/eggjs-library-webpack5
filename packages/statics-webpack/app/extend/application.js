'use strict'

const WEBPACK = Symbol('Application#WEBPACK')
const SERVICES = Symbol('Application#SERVICES')

module.exports = {
  get webpackConfigs() {
    if (!this[WEBPACK]) {
      this[WEBPACK] = {}
    }
    return this[WEBPACK]
  },

  get webpackServices() {
    if (!this[SERVICES]) {
      this[SERVICES] = {}
    }
    return this[SERVICES]
  },
}
