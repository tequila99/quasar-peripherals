const Fastify = require('fastify')
const localize = require('ajv-i18n')

export default options => {
  const { logger = false, printRoutes = false, devices = [], blDevices = [] } = options
  const fastify = Fastify({
    logger,
    ajv: {
      customOptions: {
        removeAdditional: true,
        useDefaults: true,
        coerceTypes: true,
        allErrors: true,
        nullable: true
      }
    }
  })
    .register(require('fastify-cors'))
    .register(require('./services/health'))
    .register(require('./plugins/Reader'), {
      devices, blDevices
    })
    .setErrorHandler((error, request, reply) => {
      const { statusCode = 400, message, validation, validationContext } = error
      let response
      if (validation) {
        localize.ru(validation)
        response = {
          message: `Произошла ошибка при попытке проверить ${validationContext}...`,
          errors: validation.map(({ keyword, params, message }) => ({ keyword, message }))
        }
      } else {
        response = {
          message
        }
      }
      reply.status(statusCode).send(response)
    })
  fastify.ready(() => {
    if (printRoutes) fastify.log.info(fastify.printRoutes({ commonPrefix: false }))
    fastify.barcodeScanner.connect()
  })
  return fastify
}
