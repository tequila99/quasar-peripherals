const netSetting = {
  ip: {
    type: 'string',
    pattern: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/
  },
  port: {
    type: 'number',
    enum: [8443, 8080]
  },
  username: {
    type: 'string',
    enum: ['user1', 'operator']
  },
  password: {
    type: 'string',
    enum: ['Pas$w0rd', '123456']
  }
}

module.exports = {
  info: {
    body: {
      type: 'object',
      properties: {
        ...netSetting
      },
      required: ['ip', 'port', 'username', 'password']
    }
  },
  status: {
    body: {
      type: 'object',
      properties: {
        ...netSetting
      },
      required: ['ip', 'port', 'username', 'password']
    }
  },
  setting: {
    body: {
      type: 'object',
      properties: {
        ...netSetting
      },
      required: ['ip', 'port', 'username', 'password']
    }
  }
}
