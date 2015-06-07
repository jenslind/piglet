'use strict'

const spawn = require('child_process').spawn
const notifier = require('node-notifier')
const getGruntTasks = require('get-grunt-tasks')

global.processes = {}

exports.getTasks = function () {
  return new Promise(function (resolve, reject) {
    let current = window.localStorage.getItem('current')

    if (!current) return resolve([])

    getGruntTasks(current, function (err, tasks) {
      if (err) return resolve([])

      return resolve(tasks)
    })
  })
}

exports.runTask = function (task, cb) {
  // Stop task if running
  if (global.processes[task]) {
    global.processes[task].kill()
    return
  }

  let dir = window.localStorage.getItem('current')
  var command = spawn('grunt', [task], {cwd: dir})

  // Save
  global.processes[task] = command

  cb()

  // Remove when done
  command.on('close', function (code, signal) {
    notifier.notify({
      title: 'Grunt ' + task,
      message: (!code) ? 'Done' : 'Error'
    })

    delete global.processes[task]
    cb()
  })
}

exports.stopAll = function () {
  for (let p in global.processes) {
    global.processes[p].kill()
  }

  global.processes = {}
}
