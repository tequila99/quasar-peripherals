const fp = require('fastify-plugin')
const health = require('./health.schema.js')

module.exports = fp((fastify, opts, done) => {
  fastify.get('/api/v1/health', { schema: health }, () => ({ service: 'periphery', ok: true }))
  done()
})
