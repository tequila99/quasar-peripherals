const http = require('http')
const HOST = 'localhost'
const PORT = 8100

const requestListener = function (req, res) {
  console.log(req.headers)
  req.on('data', data => {
    console.log(data.toString())
  })
  res.end('undici')
}

const server = http.createServer(requestListener)

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`)
})
