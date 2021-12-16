import { app, dialog, BrowserWindow, Tray, Menu, nativeImage, nativeTheme } from 'electron'
import path from 'path'
import os from 'os'
import Server from './Server'
import { devices, btDevices } from './devices'
import tcpPortUsed from 'tcp-port-used'
// import { getUserConfig } from './config'
import Logger from './logger'

const logLevels = process.env.NODE_ENV === 'development' ? ['info', 'error', 'debug', 'warn', 'fatal', 'trace'] : ['info', 'error']
const server = Server({
  logger: Logger(logLevels), prinRoutes: true, devices, btDevices
})
const PORT = 3030

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

const platform = process.platform || os.platform()

const useTrayIcon = platform === 'win32' || os.version().toLowerCase().includes('ubuntu')

const logo = nativeImage.createFromPath(path.resolve(__dirname, 'icons/icon.png'))
try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    icon: logo,
    width: 1024,
    height: 768,
    useContentSize: true,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(process.env.APP_URL)
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (event) => {
    if (useTrayIcon) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('minimize', (event) => {
    if (useTrayIcon) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  if (useTrayIcon) {
    mainWindow.hide()
  }
}

app.whenReady()
  .then(() => tcpPortUsed.check(PORT, 'localhost'))
  .then(inUse => {
    if (inUse) {
      dialog.showMessageBoxSync(mainWindow, {
        title: 'Квазар.Периферия',
        message: `Порт ${PORT} уже используется`,
        detail: 'Возможно запущена другая копия этой программы',
        buttons: ['Выход']
      })
      mainWindow.destroy()
      return app.quit()
    }
    const menu = Menu.buildFromTemplate([
      {
        label: 'Открыть программу',
        click () {
          mainWindow.show()
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Выйти из программы',
        click () {
          mainWindow.destroy()
          app.quit()
        }
      }
    ])
    createWindow()
    if (useTrayIcon) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
    const tray = new Tray(logo)
    tray.setToolTip('Квазар.Периферия')
    tray.setTitle('Квазар.Периферия')
    tray.setContextMenu(menu)
    mainWindow.tray = tray
    server.listen(PORT, err => {
      if (err) {
        server.log.error(err.message)
        app.quit()
      }
    })
  })

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.setLoginItemSettings({
  // openAtLogin: arg.settings.startOnStartup,
  openAtLogin: true,
  restoreState: false,
  path: app.getPath('exe')
})
