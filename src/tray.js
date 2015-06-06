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
  let tray = new Tray(__dirname + '/grunt.png')
  let trayMenu = new Menu()

  build()

  function build () {
    trayMenu.append(new MenuItem({
      label: window.localStorage.getItem('current') || 'Choose folder...',
      click: function () {
        dialog.showOpenDialog({ properties: ['openDirectory']}, function (dir) {
          if (dir !== undefined) {
            window.localStorage.setItem('current', dir)
            // Stop all tasks
            grunt.stopAll()

            // Rebuild menu
            trayMenu = new Menu()
            build()
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
            type: 'checkbox',
            click: function () {
              grunt.runTask(task, function () {
                // Rebuild menu
                trayMenu = new Menu()
                build()
              })
            }
          }

          if (global.processes[task]) {
            item.checked = true
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

        tray.setContextMenu(trayMenu)
      })
  }
})()
