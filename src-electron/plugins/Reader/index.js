const fp = require('fastify-plugin')
const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
const pnpIDParse = (pnpId, dv, bl) => dv.some(i => pnpId.includes(i.vendor) && pnpId.includes(i.productid)) || bl.fidIndex(el => pnpId.includes(el)) !== -1
const testPorts = (item, dv, bl) => (item.vendorId && item.productId)
  ? dv.some(i => i.vendor === item.vendorId.toUpperCase() && i.productid.includes(item.productId.toUpperCase()))
  : item.pnpId && pnpIDParse(item.pnpId, dv, bl)

module.exports = fp((fastify, opts, done) => {
  class Reader {
    constructor (opts) {
      if (Reader.instance) return Reader.instance
      Reader.instance = this
      this.connected = false
      this.port = null
      this.scanner = null
      this.timerId = null
      this.timeout = opts.timeout || 10000
      this.parser = new InterByteTimeout({ interval: opts.interval || 30 })
      this.devices = opts.devices || []
      this.btDevices = opts.btDevices || []
      return this
    }

    startPolling () {
      this.timerId && clearTimeout(this.timerId)
      this.timerId = setTimeout(this.connect, this.timeout)
    }

    send (message, value) {
      return true
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
          fastify.log.info(`Найден и подключен сканер штрих кода (порт ${this.port.path})`)
          this.connected = true
          this.scanner.flush(err => {
            if (err) fastify.log.error(`Ошибка при попытке сбросить сканер штрих кода (порт ${this.port.path}), ${err.message}`)
          })
          this.send('status_barcode_scanner', true)
        })
        this.scanner.on('error', err => fastify.log.error(`Ошибка сканера штрих кода (порт ${this.port.path}), ${err.message}`))
        this.scanner.on('close', () => {
          fastify.log.info(`Сканер штрих кода (порт ${this.port.path}) отключен`)
          this.send('status_barcode_scanner', false)
          this.port = { path: '', manufacturer: '', id: '' }
          this.scanner = null
          // this.startPolling()
          this.timerId && clearTimeout(this.timerId)
          this.timerId = setTimeout(() => this.connect(), this.timeout)
        })
      } catch (err) {
        console.log(err)
        fastify.log.error(`Произошла ошибка в процессе поиска сканера штрих-кода ${err.message}`)
      }
    }
  }
  fastify.decorate('barcodeScanner', new Reader(opts))
  done()
})
