module.exports = (app) => {
  app.addPageConfig(app.name)
  app.router.get('*', app.viewInject(app.name, 'index.html'), () => {})
}
