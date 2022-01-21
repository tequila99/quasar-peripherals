const { bufferToBinaryString } = require('./helper')
const { formatISO } = require('date-fns')

const BARCODE_CONTENT = [
  {
    name: 'hz',
    type: 'Number',
    label: 'ХЗ',
    length: 6
  },
  {
    name: 'ogrn',
    type: 'Number',
    label: 'ОГРН ЛПУ',
    length: 50
  },
  {
    name: 'doctor_id',
    type: 'String',
    label: 'Код врача',
    length: 56
  },
  {
    name: 'ogrn',
    type: 'Number',
    label: 'ОГРН ЛПУ',
    length: 50
  },
  {
    name: 'lpu_id',
    type: 'String',
    label: 'Код ЛПУ',
    length: 56
  },
  {
    name: 'prescription_ser',
    type: 'String',
    label: 'Серия рецепта',
    length: 112
  },
  {
    name: 'prescription_number',
    type: 'Number',
    label: 'Номер рецепта',
    length: 64
  },
  {
    name: 'mkb10_id',
    type: 'String',
    label: 'Код заболевания по МКБ10',
    length: 56
  },
  {
    name: 'fin_source',
    type: 'Number',
    label: 'Источник финансирования',
    length: 2
  },
  {
    name: 'procent',
    type: 'Number',
    label: 'Процент льготы рецепта',
    length: 1
  },
  {
    name: 'mnn_flag',
    type: 'Number',
    label: 'Признак МНН(0)/ТоргНаим(1)',
    length: 1
  },
  {
    name: 'mnn_id',
    type: 'Number',
    label: 'Код МНН/ТоргНаименования (в кодировке 2006 г.)',
    length: 44
  },
  {
    name: 'person_id',
    type: 'Number',
    label: 'СНИЛС',
    length: 37
  },
  {
    name: 'dosage',
    type: 'String',
    label: 'Дозировка',
    length: 160
  },
  {
    name: 'amount',
    type: 'Number',
    label: 'Количество единиц',
    length: 24
  },
  {
    name: 'person_ctg',
    type: 'Number',
    label: 'Код категории гражданина',
    length: 10
  },
  {
    name: 'expired',
    type: 'Number',
    label: 'Срок действия',
    length: 1
  },
  {
    name: 'year',
    type: 'Number',
    label: 'Год выписки рецепта',
    length: 7
  },
  {
    name: 'month',
    type: 'Number',
    label: 'Месяц выписки рецепта',
    length: 4
  },
  {
    name: 'day',
    type: 'Number',
    label: 'День выписки рецепта',
    length: 5
  }
]

const stringFromBinaryString = str => String.fromCodePoint(...str.split(/([0-1]{8})/).filter(Boolean).map(el => parseInt(el, 2)).filter(Boolean)).trim()

const formatPerson = personId => personId.toString().padStart(11, '0')

const dateFromNumber = ({ year, month, day, person_id: personId, ...params }) => (
  {
    ...params,
    day,
    month,
    year,
    date_rcp: formatISO(new Date(2000 + year, --month, day)),
    person_id: formatPerson(personId)
  }
)

const parseBinaryString = data => BARCODE_CONTENT.reduce((acc, el) => {
  const str = data.substr(acc[1], el.length)
  let value = null
  if (el.type === 'Number') value = parseInt(str, 2)
  if (el.type === 'String') value = stringFromBinaryString(str)
  acc[0] = { ...acc[0], [el.name]: value }
  acc[1] += el.length
  return acc
}, [{}, 0])[0]

const parseString = data => dateFromNumber(parseBinaryString(bufferToBinaryString(data)))

module.exports = data => parseString(Buffer.from(data.toString().trim(), 'base64'))
