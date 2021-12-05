const fp = require('fastify-plugin')
const axios = require('axios')
const https = require('https')
const agent = new https.Agent({ rejectUnauthorized: false })

module.exports = fp((fastify, opts, done) => {
  class Disposal {
    constructor ({ ip, port, username, password }) {
      this.ip = ip
      this.port = port
      this.username = username
      this.password = password
    }

    get token () {
      return Buffer.from(`${this.username}:${this.password}`, 'utf8').toString('base64')
    }

    getSetting () {
      return axios({
        method: 'get',
        baseURL: `https://${this.ip}:${this.port}/v1/`,
        url: 'setting',
        headers: {
          Authorization: `Basic ${this.token}`
        },
        httpsAgent: agent
      })
    }

    getStatus () {
      return axios({
        method: 'get',
        baseURL: `https://${this.ip}:${this.port}/v1/`,
        url: 'state',
        headers: {
          Authorization: `Basic ${this.token}`
        },
        httpsAgent: agent
      })
    }

    getInfo () {
      return axios({
        method: 'get',
        baseURL: `https://${this.ip}:${this.port}/v1/`,
        url: 'deviceInfo',
        headers: {
          Authorization: `Basic ${this.token}`
        },
        httpsAgent: agent
      })
    }
  }
  fastify.decorate('Disposal', Disposal)
  done()
})
