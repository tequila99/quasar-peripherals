const fp = require('fastify-plugin')
const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
const { pipeline } = require('stream')
const { testPorts } = require('./helper')
const decoderStream = require('./decoder')

module.exports = fp((fastify, opts, done) => {
  class BarcodeReader {
    constructor (opts) {
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
      this.log = opts.logger || console
    }

    startPolling () {
      if (this.timerId) clearTimeout(this.timerId)
      this.timerId = setTimeout(this.connect, this.timeout)
    }

    send (messageName, value) {
      if (!this.connector) return
      this.connector.send(messageName, value)
    }

    async searchPort () {
      const avaliblePorts = await SerialPort.list()
      const scannerPort = avaliblePorts.find(el => testPorts(el, this.devices, this.btDevices))
      if (!scannerPort) return null
      const { manufacturer = '', pnpId: id = '', path = '' } = scannerPort
      return { path, manufacturer, id }
    }

    initPort () {
      this.scanner = new SerialPort(this.port.path)
      this.scanner.on('open', () => {
        if (this.timerId) clearTimeout(this.timerId)
        this.log.info(`Найден и подключен сканер штрих кода (порт ${this.port.path})`)
        this.connected = true
        this.scanner.flush(err => {
          if (err) this.log.error(`Ошибка при попытке сбросить сканер штрих кода (порт ${this.port.path}), ${err.message}`)
        })
        this.send('status_barcode_scanner', true)
      })
      this.scanner.on('error', err => this.log.error(`Ошибка сканера штрих кода (порт ${this.port.path}), ${err.message}`))
      this.scanner.on('close', () => {
        this.log.info(`Сканер штрих кода (порт ${this.port.path}) отключен`)
        this.port = null
        this.scanner = null
        this.connected = false
        this.send('status_barcode_scanner', false)
        this.startPolling()
      })
    }

    async connect () {
      try {
        if (this.connected) return
        this.port = await this.searchPort()
        if (!this.port) return this.startPolling()
        this.initPort()
        pipeline(
          this.scanner,
          this.parser,
          decoderStream,
          err => this.log.error(`Ошибка при обработке данных сканера штрих кода (порт ${this.port.path}), ${err.message}`)
        ).on('data', ({ name, message, data }) => {
          this.log.info(message)
          this.log.debug(data)
          this.send(name, data)
        })
      } catch (err) {
        this.log.error(`Произошла ошибка в процессе поиска сканера штрих-кода ${err.message}`)
      }
    }
  }
  fastify.decorate('barcodeReader', new BarcodeReader(opts))
  done()
})
