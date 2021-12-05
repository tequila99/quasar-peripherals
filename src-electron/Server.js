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
    .register(require('./plugins/BarcodeReader'), {
      devices, blDevices
    })
    .register(require('./plugins/Disposal'))
    .register(require('fastify-socket.io'), {
      cors: {
        methods: 'GET,PUT,POST,OPTIONS',
        allowedHeaders: 'Content-Type',
        preflightContinue: true,
        credentials: false
      },
      allowEIO3: true
    })
    .register(require('./services/disposal'), { prefix: '/disposal' })
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
    const { log, barcodeReader, io } = fastify
    if (printRoutes) log.info(fastify.printRoutes({ commonPrefix: false }))
    barcodeReader.connect()
    io.on('connection', socket => {
      log.info(`Установлено соединение с сокетом с ID: ${socket.id}`)
      barcodeReader.socket = socket
      socket.emit('status_barcode_scanner', barcodeReader.connected)
      socket.on('get_status_barcode_scanner', () => {
        socket.emit('status_barcode_scanner', barcodeReader.connected)
      })
      socket.on('reconnect', () => {
        socket.emit('status_barcode_scanner', barcodeReader.connected)
      })
      socket.on('disconnect', reason => {
        barcodeReader.socket = null
        log.info(`Соединение с сокетом с ID: ${socket.id} разорвано по причине: ${reason}`)
      })
    })
  })
  return fastify
}
