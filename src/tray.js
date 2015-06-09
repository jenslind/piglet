'use strict'

void (function () {
  const FINDER_UPDATE = 1000

  const remote = require('remote')
  const Tray = remote.require('tray')
  const Menu = remote.require('menu')
  const MenuItem = remote.require('menu-item')
  const dialog = remote.require('dialog')
  const ipc = require('ipc')
  const grunt = require('./lib/Grunt')
  const tildify = require('tildify')
  const currentPath = require('current-path')

  var finderInterval

  // Set up tray menu.
  let tray = new Tray(__dirname + '/gruntTemplate.png')
  let trayMenu = new Menu()

  build()

  function build () {
    // Current menu
    let currentMenu = new Menu()
    currentMenu.append(new MenuItem({
      label: 'Follow Finder',
      type: 'checkbox',
      checked: window.localStorage.getItem('followFinder') === 'true',
      click: function (item) {
        window.localStorage.setItem('followFinder', item.checked)
        rebuild()
      }
    }))

    currentMenu.append(new MenuItem({type: 'separator'}))

    currentMenu.append(new MenuItem({
      label: 'Choose folder...',
      click: function () {
        dialog.showOpenDialog({ properties: ['openDirectory']}, function (dir) {
          if (dir !== undefined) {
            window.localStorage.setItem('current', dir)

            // Do not follow finder
            window.localStorage.setItem('followFinder', 'false')
            clearInterval(finderInterval)

            if (Object.keys(global.processes).length > 0) {
              // Stop all tasks
              grunt.stopAll()
            } else {
              rebuild()
            }
          }
        })
      }
    }))

    let current = window.localStorage.getItem('current') || 'Choose folder...'
    trayMenu.append(new MenuItem({
      label: tildify(current),
      submenu: currentMenu
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
                rebuild()
              })
            }
          }

          if (global.processes[current]) {
            if (global.processes[current][task]) {
              item.checked = true
            }
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

    // Follow Finder
    if (window.localStorage.getItem('followFinder') === 'true') {
      finderInterval = setInterval(function () {
        currentPath(function (err, path) {
          if (!err && window.localStorage.getItem('current') !== path) {
            window.localStorage.setItem('current', path)

            rebuild()
          }
        })
      }, FINDER_UPDATE)
    }
  }

  // Rebuild the tray
  function rebuild () {
    clearInterval(finderInterval)
    trayMenu = new Menu()
    build()
  }
})()
