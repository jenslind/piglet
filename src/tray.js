'use strict'

void (function () {
  const remote = require('remote')
  const Tray = remote.require('tray')
  const Menu = remote.require('menu')
  const MenuItem = remote.require('menu-item')
  const dialog = remote.require('dialog')
  const ipc = require('ipc')
  const grunt = require('./lib/Grunt')
  const tildify = require('tildify')

  // Set up tray menu.
  let tray = new Tray(__dirname + '/gruntTemplate.png')
  let trayMenu = new Menu()

  // Rebuild menu on update-download
  ipc.on('update-downloaded', function (installUpdate) {
    trayMenu = new Menu()
    build(installUpdate)
  })

  build()

  function build (installUpdate) {
    let current = window.localStorage.getItem('current') || 'Choose folder...'
    trayMenu.append(new MenuItem({
      label: tildify(current),
      click: function () {
        dialog.showOpenDialog({ properties: ['openDirectory']}, function (dir) {
          if (dir !== undefined) {
            window.localStorage.setItem('current', dir)
            if (Object.keys(global.processes).length > 0) {
              // Stop all tasks
              grunt.stopAll()
            } else {
              trayMenu = new Menu()
              build()
            }
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

        if (installUpdate) {
          trayMenu.append(new MenuItem({
            label: 'Install update',
            click: function () {
              installUpdate()
            }
          }))
        }

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
