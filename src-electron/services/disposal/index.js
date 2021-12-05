const { status, info, setting } = require('./disposal.schema.js')

module.exports = function (fastify, opts, done) {
  fastify.post('/status', { schema: status }, (request, reply) => {
    const disposal = new fastify.Disposal(request.body)
    return disposal.status()
  })
  fastify.post('/info', { schema: info }, (request, reply) => {
    const disposal = new fastify.Disposal(request.body)
    return disposal.info()
  })
  fastify.post('/setting', { schema: setting }, (request, reply) => {
    const disposal = new fastify.Disposal(request.body)
    return disposal.setting()
  })
  done()
}
