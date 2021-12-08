const netSetting = {
  ip: {
    type: 'string',
    // eslint-disable-next-line
    pattern: '^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$'
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

const info = {
  body: {
    type: 'object',
    properties: {
      ...netSetting
    },
    required: ['ip', 'port', 'username', 'password']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        devices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                maxLength: 64
              },
              connectionType: {
                type: 'string',
                enum: ['usb', 'wifi', 'ethernet']
              },
              modelInfo: {
                type: 'string',
                maxLength: 256
              },
              softwareVersion: {
                type: 'string',
                maxLength: 16
              },
              deviceSerialNumber: {
                type: 'string',
                maxLength: 16
              },
              moduleSerialNumber: {
                type: 'string',
                maxLength: 16
              },
              startDateRegistration: {
                type: 'string'
              },
              endDateRegistration: {
                type: 'string'
              },
              timeBlock: {
                type: 'string'
              },
              suid: {
                type: 'string',
                pattern: '[0-9]{14}'
              }
            },
            required: [
              'id', 'connectionType', 'modelInfo',
              'softwareVersion', 'deviceSerialNumber',
              'moduleSerialNumber'
            ]
          }
        }
      }

    }
  }
}

const status = {
  body: {
    type: 'object',
    properties: {
      ...netSetting
    },
    required: ['ip', 'port', 'username', 'password']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        expirationDate: {
          type: 'string',
          description: 'Дата истечении срока службы МБ РВ в формате "yyyy-MM-dd\'T\'HH:mm:ss\'Z\'".'
        },
        lifePhase: {
          type: 'string',
          description: 'Состояние РВ.',
          enum: ['notRegistered', 'onRegistration', 'registered', 'expired']
        },
        logState: {
          type: 'string',
          description: 'Состояние журнала КМ с ошибками',
          enum: ['full', 'empty', 'partial']
        },
        processState: {
          type: 'string',
          description: 'Состояние процесса обработки данных в РВ.',
          enum: ['waiting', 'checkCode', 'documentOpened', 'checkDocument']
        },
        deviceError: {
          type: 'number',
          description: 'Код ошибки РВ',
          enum: [0, 1, 2, 3, 4, 5, 6, 7, 8],
          default: 0
        }
      },
      required: ['expirationDate', 'lifePhase', 'logState', 'processState', 'deviceError']
    }
  }
}

module.exports = {
  info,
  status,
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
