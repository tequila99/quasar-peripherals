function pnpIDParse (pnpId, dv, bl) {
  return dv.some(i => pnpId.includes(i.vendor) && pnpId.includes(i.productid)) || bl.findIndex(el => pnpId.includes(el)) !== -1
}

function bufferToBinaryString (buf) {
  let binaryString = ''
  for (let offset = 0, length = buf.length; offset < length; offset++) {
    binaryString += buf.readUInt8(offset).toString(2).padStart(8, '0')
  }
  return binaryString
}

function testPorts (item, dv, bl) {
  return (item.vendorId && item.productId)
    ? dv.some(i => i.vendor === item.vendorId.toUpperCase() && i.productid.includes(item.productId.toUpperCase()))
    : item.pnpId && pnpIDParse(item.pnpId, dv, bl)
}

module.exports = {
  bufferToBinaryString, testPorts
}
