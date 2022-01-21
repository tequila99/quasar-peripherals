const fp = require('fastify-plugin')

module.exports = fp((fastify, opts, done) => {
  const { log, Disposal } = fastify
  const { maxAttempt = 10 } = opts
  class Task {
    constructor ({ rvRequestId, ...args }) {
      this.id = rvRequestId
      this.disposal = new Disposal({ ...args }, opts.logger)
      this.status = null
      this.result = null
      this.error = null
      this.attempt = 0
    }

    async check () {
      try {
        const { statusCode, data } = await this.disposal.check(this.id)
        if (statusCode !== 200 || !data.results) {
          this.attempt++
          if (this.attempt > maxAttempt) return { type: 'abort', data: {} }
          return { type: 'continue', data: {} }
        }
        const { status, result = {}, error = {} } = data.results
        if (['wait', 'inProgress'].includes(status)) return { type: 'continue', data: {} }
        if (status === 'error') return { type: 'error', data: error }
        if (status === 'ready') return { type: 'done', data: result }
        this.attempt++
        return { type: 'continue', data: {} }
      } catch (error) {
        this.attempt++
        return { type: 'continue', data: {} }
      }
    }
  }

  class TasksQueue {
    constructor (opts) {
      if (TasksQueue.instance) return TasksQueue.instance
      TasksQueue.instance = this
      this.queue = []
      this.connector = null
      this.log = opts.logger || console
    }

    add ({ rvRequestId, ...args }) {
      const task = new Task({ rvRequestId, ...args })
      this.queue.push(task)
      log.info(`В очередь помещено задание с ID ${rvRequestId}`)
    }

    send (message, value) {
      if (!this.connector) return
      this.connector.send(message, value)
    }

    async check () {
      if (!this.queue.length) return
      const task = this.queue.shift()
      const { type, data } = await task.check()
      if (type === 'continue') this.queue.push(task)
      if (type === 'done') {
        this.log.info(`Задание с ID: ${task.id} успешно завершено`)
        this.send('mdlp_disposal_done', JSON.stringify({ id: task.id, ...data }))
      }
      if (type === 'error') {
        this.log.info(`Задание с ID: ${task.id} завершено с ошибкойЖ: ${data}`)
        this.send('mdlp_disposal_error', JSON.stringify({ id: task.id, ...data }))
      }
    }
  }
  fastify.decorate('taskQueue', new TasksQueue(opts))
  done()
})
