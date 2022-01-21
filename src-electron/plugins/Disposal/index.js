const fp = require('fastify-plugin')
const { request } = require('undici')
const { transformMarks } = require('./helper')
const { v4 } = require('uuid')

module.exports = fp((fastify, opts, done) => {
  class Disposal {
    constructor ({ ip, port, username, password, ...args }, logger = opts.logger) {
      this.ip = ip
      this.port = port
      this.username = username
      this.password = password
      const {
        typeDocument = null,
        dateDocument = null,
        numberDocument = null,
        seriesDocument = null,
        marks = []
      } = args
      this.typeDocument = typeDocument
      this.dateDocument = dateDocument
      this.numberDocument = numberDocument
      this.seriesDocument = seriesDocument
      this.rowMarks = marks
      this.log = logger || console
    }

    get token () {
      return Buffer.from(`${this.username}:${this.password}`, 'utf8').toString('base64')
    }

    get marks () {
      return transformMarks(this.rowMarks)
    }

    get type () {
      return this.typeDocument
    }

    get code () {
      return this.typeDocument ? '3108805' : '0504204'
    }

    get codeName () {
      return this.typeDocument ? 'Рецепт по форме 148-1/у-04(л)' : 'Требование-накладная'
    }

    async check (uuid) {
      return request(`https://${this.ip}:${this.port}/v1/requests/${uuid}`, {
        headers: {
          Authorization: `Basic ${this.token}`
        }
      }).then(async ({ statusCode, body }) => {
        const data = await body.json()
        this.log.info(`Результаты проверки задания с ID ${uuid}: ${JSON.stringify(data)}`)
        return { statusCode, data }
      })
    }

    async send () {
      const rvRequestId = v4()
      this.log.info(`Формируется задание на вывод из оборота с ID ${rvRequestId}`)
      return request(`https://${this.ip}:${this.port}/v1/requests`, {
        method: 'POST',
        headers: {
          accept: 'application/json, text/plain, */*',
          Authorization: `Basic ${this.token}`,
          'Content-Type': 'application/json;charset=utf-8',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          rvRequestId,
          request: {
            type: 'registerMarksByRequisites',
            documentOut: {
              type: this.type,
              code: this.code,
              codeName: this.codeName,
              date: this.dateDocument,
              series: this.seriesDocument || '',
              number: this.numberDocument
            },
            marks: this.marks
          }
        })
      }).then(({ statusCode }) => ({ statusCode, data: { rvRequestId } }))
    }

    getSetting () {
      return request(`https://${this.ip}:${this.port}/v1/settings`, {
        headers: {
          Authorization: `Basic ${this.token}`
        }
      }).then(({ statusCode, body }) => {
        return statusCode === 200 ? body.json() : new Error('Произошла ошибка при попытке получить статус регистратора выбытия')
      })
    }

    getStatus () {
      return request(`https://${this.ip}:${this.port}/v1/state`, {
        headers: {
          Authorization: `Basic ${this.token}`
        }
      }).then(({ statusCode, body }) => {
        return statusCode === 200 ? body.json() : new Error('Произошла ошибка при попытке получить статус регистратора выбытия')
      })
    }

    getInfo () {
      return request(`https://${this.ip}:${this.port}/v1/deviceInfo`, {
        headers: {
          Authorization: `Basic ${this.token}`
        }
      }).then(async ({ statusCode, body }) => {
        return statusCode === 200 ? body.json() : new Error('Произошла ошибка при попытке получить статус регистратора выбытия')
      })
    }
  }
  fastify.decorate('Disposal', Disposal)
  done()
})
