'use strict'
const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')
const fixPath = require('fix-path')

// report crashes to the Electron project
require('crash-reporter').start()

let mainWindow

app.on('ready', function () {
  // Fix $PATH
  fixPath()

  // Hide in dock
  app.dock.hide()

  // Main window
  mainWindow = new BrowserWindow({
    show: false
  })

  mainWindow.loadUrl(`file://${__dirname}/index.html`)

  // Quit app
  ipc.on('app-quit', function () {
    app.quit()
  })

})
