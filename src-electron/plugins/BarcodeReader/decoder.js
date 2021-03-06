/* eslint-disable no-control-regex */
const transformOmc = require('./omc')
const transformMdlp = require('./mdlp')
const transformPrescription = require('./prescription')
const transformSscc = require('./sscc')
const PRESCRIPTION_REGEXP = /^p([a-zA-Z0-9/+]*==)$/
const MDLP_REGEXP = /01\d{14}.*21[!-&%-_/0-9A-Za-z]{13}\u001d/

const EAN13_REGEXP = /^[0-9]{13}$/
const SSCC_REGEXP = /^[0-9]{18,20}$/

const DECODERS = [
  {
    name: 'omc',
    message: 'Прочитан полис ОМС',
    test: data => data.readUInt8(0) === 2,
    transform: transformOmc
  },
  {
    name: 'llo_prescrition',
    message: 'Прочитан льготного рецепт',
    test: data => PRESCRIPTION_REGEXP.test(data.toString().trim()),
    transform: transformPrescription
  },
  {
    name: 'mdlp_pack',
    message: 'Прочитана маркировка лекарственного срества',
    test: data => MDLP_REGEXP.test(data.toString().trim()),
    transform: transformMdlp
  },
  {
    name: 'ean13',
    message: 'Прочитан потребительский штрих-код EAN13',
    test: data => EAN13_REGEXP.test(data.toString().trim()),
    transform: data => data.toString().trim()
  },
  {
    name: 'sscc',
    message: 'Прочитан код группавой упаковки',
    test: data => SSCC_REGEXP.test(data.toString().trim()),
    transform: transformSscc
  }
]

module.exports = barcode => {
  const dt = DECODERS.find(el => el.test(barcode))
  if (!dt) return null
  return { name: dt.name, message: dt.message, data: dt.transform(barcode) }
}
