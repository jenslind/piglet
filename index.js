'use strict'
const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')
const fixPath = require('fix-path')
const Update = require('electron-gh-releases')

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

  // Auto-update
  let options = {
    repo: 'jenslind/piglet',
    currentVersion: app.getVersion()
  }

  let update = new Update(options, function (auto_updater) {
    // Auto updater event listener
    auto_updater.on('update-downloaded', function (e, rNotes, rName, rDate, uUrl, quitAndUpdate) {
      mainWindow.webContents.send('update-downloaded', quitAndUpdate)
    })
  })

  // Check for updates
  update.check(function (err, status) {
    if (!err && status) {
      update.download()
    }
  })

})
