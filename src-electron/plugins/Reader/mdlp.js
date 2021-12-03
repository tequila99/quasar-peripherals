const getValues = data => ({ gtin: data[1], packid: data[2], sgtin: `${data[1]}${data[2]}` })

// eslint-disable-next-line no-control-regex
const parseString = data => getValues(data.match(/01(\d{14}).*21([!-&%-_/0-9A-Za-z]{13})\u001d/))

module.exports data => ({
  ...parseString(data.toString().trim()),
  mark: Buffer.from(data.toString('hex').replace(/0d$/, '').replace(/0d0a$/, ''), 'hex').toString('base64')
})
