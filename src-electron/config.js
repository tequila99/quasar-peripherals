const fs = require('fs')
const path = require('path')

module.exports = {
  getUserConfig () {
    const userConfigPath = path.join(process.resourcesPath, 'config.json')
    return JSON.parse(fs.readFileSync(userConfigPath, 'utf8'))
  }
}
