const SerialPort = require('serialport')
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout')
const { pipeline } = require('stream')
const PORT_PATH = '/dev/ttyACM0'

const scanner = new SerialPort(PORT_PATH)
const parser = new InterByteTimeout({ interval: 30 })
scanner.on('open', () => console.log('Сканнер штрих-кода подключен'))
pipeline(
  scanner,
  parser,
  err => console.log(err)
)
  .on('data', data => console.log(data))
  .on('open', () => console.log('Сканер штрих кода подключен'))
