module.exports = {
  tags: ['health'],
  response: {
    200: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          default: 'perifery'
        },
        ok: {
          type: 'boolean',
          default: true
        }
      },
      required: ['service', 'ok']
    }
  }
}
