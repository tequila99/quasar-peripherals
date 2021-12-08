const { send, status, info, setting } = require('./disposal.schema.js')
module.exports = function (fastify, opts, done) {
  const { Disposal, log, taskQueue } = fastify
  fastify.post('/status', { schema: status }, (request, reply) => {
    const disposal = new Disposal(request.body, log)
    return disposal.getStatus()
  })
  fastify.post('/info', { schema: info }, (request, reply) => {
    const disposal = new Disposal(request.body, log)
    return disposal.getInfo()
  })
  fastify.post('/settings', { schema: setting }, (request, reply) => {
    const disposal = new Disposal(request.body, log)
    return disposal.getSetting()
  })
  fastify.post('/request/send', { schema: send }, async (request, reply) => {
    const disposal = new Disposal(request.body, log)
    const { statusCode, data } = await disposal.send()
    reply.statusCode = statusCode
    if (statusCode === 201) {
      taskQueue.add({
        rvRequestId: data.rvRequestId,
        ...request.body
      })
    }
    return data
  })
  fastify.post('/request/check', async (request, reply) => {
    const disposal = new Disposal(request.body, log)
    const { rvRequestId } = request.body
    const { statusCode, data } = await disposal.check(rvRequestId)
    reply.statusCode = statusCode
    return data
  })
  done()
}
