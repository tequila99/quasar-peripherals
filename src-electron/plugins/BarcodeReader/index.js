const fp = require('fastify-plugin')
const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
const { testPorts } = require('./helper')
const decoder = require('./decoder')

module.exports = fp((fastify, opts, done) => {
  const { log } = fastify
  class BarcodeReader {
    constructor (opts, log = console) {
      if (BarcodeReader.instance) return BarcodeReader.instance
      BarcodeReader.instance = this
      this.connected = false
      this.port = null
      this.scanner = null
      this.timerId = null
      this.timeout = opts.timeout || 10000
      this.parser = new InterByteTimeout({ interval: opts.interval || 30 })
      this.devices = opts.devices || []
      this.btDevices = opts.btDevices || []
      this.connector = null
      this.log = log
    }

    startPolling () {
      this.timerId && clearTimeout(this.timerId)
      this.timerId = setTimeout(this.connect, this.timeout)
    }

    send (messageName, value) {
      if (!this.connector) return
      this.connector.send(messageName, value)
    }

    async connect () {
      try {
        if (this.connected) return
        const avaliblePorts = await SerialPort.list()
        const scannerPort = avaliblePorts.find(el => testPorts(el, this.devices, this.btDevices))
        if (!scannerPort) {
          this.timerId && clearTimeout(this.timerId)
          this.timerId = setTimeout(() => this.connect(), this.timeout)
          return
        }
        const { manufacturer = '', pnpId: id = '', path = '' } = scannerPort
        this.port = { path, manufacturer, id }
        this.scanner = new SerialPort(path)
        this.scanner.pipe(this.parser)
        this.scanner.on('open', () => {
          this.timerId && clearTimeout(this.timerId)
          this.log.info(`Найден и подключен сканер штрих кода (порт ${this.port.path})`)
          this.connected = true
          this.scanner.flush(err => {
            if (err) this.log.error(`Ошибка при попытке сбросить сканер штрих кода (порт ${this.port.path}), ${err.message}`)
          })
          this.send('status_barcode_scanner', true)
        })
        this.scanner.on('error', err => fastify.log.error(`Ошибка сканера штрих кода (порт ${this.port.path}), ${err.message}`))
        this.scanner.on('close', () => {
          this.log.info(`Сканер штрих кода (порт ${this.port.path}) отключен`)
          this.send('status_barcode_scanner', false)
          this.port = { path: '', manufacturer: '', id: '' }
          this.scanner = null
          this.connected = false
          this.timerId && clearTimeout(this.timerId)
          this.timerId = setTimeout(() => this.connect(), this.timeout)
        })
        this.parser.on('data', barcode => {
          const parsedBarcode = decoder(barcode)
          if (!parsedBarcode) {
            this.log.error('Прочитан неизвестный формат штрих кода')
            return
          }
          const { name, message, data } = parsedBarcode
          this.log.info(message)
          this.log.debug(data)
          this.send(name, data)
        })
      } catch (err) {
        this.log.error(`Произошла ошибка в процессе поиска сканера штрих-кода ${err.message}`)
      }
    }
  }
  fastify.decorate('barcodeReader', new BarcodeReader(opts, log))
  done()
})
