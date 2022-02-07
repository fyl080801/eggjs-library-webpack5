const STATICS = Symbol('Application#statcis')

module.exports = {
  get statics() {
    if (!this[STATICS]) {
      this[STATICS] = {}
    }
    return this[STATICS]
  },

  addPageConfig(name, dir) {},

  viewInject(name, view) {},
}
