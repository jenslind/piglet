'use strict'

void (function () {
  const remote = require('remote')
  const Tray = remote.require('tray')
  const Menu = remote.require('menu')
  const MenuItem = remote.require('menu-item')
  const dialog = remote.require('dialog')
  const ipc = require('ipc')
  const grunt = require('./lib/Grunt')

  // Set up tray menu.
  let tray = new Tray('IconTemplate.png')
  let trayMenu = new Menu()

  build()

  function build () {
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

    grunt.getTasks()
      .then(function (tasks) {
        for (let task of tasks) {
          let item = {
            label: task,
            click: function () {
              grunt.runTask(task, function () {
                // Rebuild menu
                trayMenu = new Menu()
                build()
              })
            }
          }

          if (global.processes[task]) {
            item.icon = 'running.png'
          }

          trayMenu.append(new MenuItem(item))
        }

        trayMenu.append(new MenuItem({type: 'separator'}))

        trayMenu.append(new MenuItem({
          label: 'Quit',
          click: function () {
            ipc.send('app-quit')
          }
        }))

        trayMenu.items[0].label = ':D'

        tray.setContextMenu(trayMenu)
      })
  }
})()
