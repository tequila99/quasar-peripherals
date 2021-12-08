const getMark = el => typeof el === 'object' && el.mark ? el.mark : el

const getSoldPart = el => typeof el === 'object' && el.soldPart ? { soldPart: el.soldPart } : {}

const transformMarks = marks => marks.reduce((acc, el, i) => ({
  ...acc, [el.sgtin || i + 1]: { mark: getMark(el), ...getSoldPart(el) }
}), {})

module.exports = {
  transformMarks
}
