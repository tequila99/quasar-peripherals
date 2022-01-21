const fp = require('fastify-plugin')

module.exports = fp((fastify, opts, done) => {
  class Connect {
    constructor (connect) {
      this.connect = connect
      this.id = connect.id
    }

    send (message, value) {
      this.connect.emit(message, value)
    }

    on () {
      return this.connect.on
    }
  }

  class Connector {
    constructor () {
      if (Connector.instance) return Connector.instance
      Connector.instance = this
      this.connectors = []
      this.log = opts.logger || console
    }

    addConnect (socket) {
      if (this.connectors.find(el => el.id === socket.id)) return
      this.log.info(`Установлено соединение с ID: ${socket.id}`)
      const connect = new Connect(socket)
      this.connectors.push(connect)
      socket.on('disconnect', reason => {
        this.removeConnect(connect)
        this.log.info(`Соединение с ID: ${connect.id} разорвано по причине: ${reason}`)
      })
      return connect
    }

    removeConnect (connect) {
      const index = this.connectors.findIndex(el => el.id === connect.id)
      if (index !== -1) this.connectors.splice(index, 1)
    }

    send (messageName, value) {
      this.connectors.forEach(connect => {
        this.log.debug(`Отправляем сообщение ${messageName} через соединение с ID ${connect.id}`)
        connect.send(messageName, value)
      })
    }
  }

  fastify.decorate('connector', new Connector(opts))
  done()
})
