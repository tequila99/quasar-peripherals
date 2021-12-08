const fp = require('fastify-plugin')

module.exports = fp((fastify, opts, done) => {
  const { log } = fastify

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
    constructor (log = console) {
      if (Connector.instance) return Connector.instance
      Connector.instance = this
      this.connectors = []
      this.log = log
    }

    addConnect (socket) {
      if (this.connectors.find(el => el.id === socket.id)) return
      this.log.info(`Установлено соединение с ID: ${socket.id}`)
      const connect = new Connect(socket)
      this.connectors.push(connect)
      connect.on('disconnect', reason => {
        this.removeConnector(connect)
        this.log.info(`Соединение с ID: ${connect.id} разорвано по причине: ${reason}`)
      })
      return connect
    }

    removeConnect (socket) {
      const index = this.connectors.findIndex(el => el.id === socket.id)
      if (index !== -1) this.connectors.splice(index, 1)
    }

    send (messageName, value) {
      this.connectors.forEach(connect => {
        this.log.debug(`Отправляем сообщение ${messageName} через соединение с ID ${connect.id}`)
        connect.send(messageName, value)
      })
    }
  }

  fastify.decorate('connector', new Connector(log))
  done()
})
