'use strict'

void (function () {
  const remote = require('remote')
  const Tray = remote.require('tray')
  const Menu = remote.require('menu')
  const MenuItem = remote.require('menu-item')
  const dialog = remote.require('dialog')
  const ipc = require('ipc')

  // Set up tray menu.
  let tray = new Tray('IconTemplate.png')
  let trayMenu = new Menu()

  trayMenu.append(new MenuItem({
    label: window.localStorage.getItem('current'),
    click: function () {
      dialog.showOpenDialog({ properties: ['openDirectory']}, function (dir) {
        if (dir !== undefined) {
          window.localStorage.setItem('current', dir)
        }
      })
    }
  }))

  trayMenu.append(new MenuItem({type: 'separator'}))

  trayMenu.append(new MenuItem({
    label: 'Quit',
    click: function () {
      ipc.send('app-quit')
    }
  }))

  tray.setContextMenu(trayMenu)
})()
