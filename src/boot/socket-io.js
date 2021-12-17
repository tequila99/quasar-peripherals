import { boot } from 'quasar/wrappers'
import io from 'socket.io-client'
const localbaseurl = 'http://127.0.0.1:3030'

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app, store }) => {
  const socket = io(localbaseurl, {
    withCredentials: false
  })
  app.config.globalProperties.$localsocket = socket
  socket.on('connect', () => {
    console.debug(`Связь с локальным сокетом ${socket.id} установлена`)

    socket.on('mdlp_pack', data => {

    })
    socket.on('sscc', data => {

    })
    socket.on('llo_prescrition', data => {

    })
    socket.on('status_barcode_scanner', data => {
      // console.log('data', data)
    })
    socket.on('ean13', data => {

    })
    // socket.onAny((event, ...args) => {
    //   console.log(`got ${event}`)
    // })
  })
  socket.on('disconnect', () => {
    console.debug('Связь с локальным сокетом потеряна')
  })
})
