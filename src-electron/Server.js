const Fastify = require('fastify')
const { fastifySchedulePlugin } = require('fastify-schedule')
const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler')
const localize = require('ajv-i18n')

export default options => {
  const {
    logger = false,
    checkTimer = 10,
    printRoutes = false,
    devices = [],
    blDevices = []
  } = options
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
    .register(fastifySchedulePlugin)
    .register(require('./plugins/BarcodeReader'), {
      devices, blDevices, logger
    })
    .register(require('./plugins/Connector'))
    .register(require('./plugins/Disposal'))
    .register(require('./plugins/TasksQueue'))
    .register(require('fastify-socket.io'), {
      cors: {
        methods: 'GET,PUT,POST,OPTIONS',
        allowedHeaders: 'Content-Type',
        preflightContinue: true,
        credentials: false
      },
      allowEIO3: true
    })
    .register(require('./services/disposal'), { prefix: '/api/v1/disposal' })
    .setErrorHandler((error, request, reply) => {
      const { statusCode = 400, message, validation, validationContext } = error
      fastify.log.error(error)
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
    const { log, barcodeReader, io, connector, taskQueue } = fastify
    if (printRoutes) log.info(fastify.printRoutes({ commonPrefix: false }))
    barcodeReader.connector = connector
    taskQueue.connector = connector
    barcodeReader.connect()
    io.on('connection', socket => {
      const connect = connector.addConnect(socket)
      connect.send('status_barcode_scanner', barcodeReader.connected)
      connect.on('get_status_barcode_scanner', () => {
        connect.send('status_barcode_scanner', barcodeReader.connected)
      })
      connect.on('reconnect', () => {
        connect.emit('status_barcode_scanner', barcodeReader.connected)
      })
    })
    const task = new AsyncTask(
      'Проверка очереди заданий на проверку статуса вывода из оборота',
      () => {
        fastify.log.debug(`Выполняется запуск задания каждые ${checkTimer} секунд`)
        return fastify.taskQueue.check()
      },
      err => {
        fastify.log.error(err.message)
      }
    )
    const job = new SimpleIntervalJob({ seconds: checkTimer }, task)

    fastify.scheduler.addSimpleIntervalJob(job)
  })
  return fastify
}
