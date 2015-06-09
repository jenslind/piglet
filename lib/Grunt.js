'use strict'

const spawn = require('child_process').spawn
const notifier = require('node-notifier')
const getGruntTasks = require('get-grunt-tasks')
const fs = require('fs')
const path = require('path')

global.processes = {}

exports.hasFile = function (p, cb) {
  fs.stat(path.join(p, 'gruntfile.js'), function (err, stats) {
    if (err) return cb(false)
    return cb(true)
  })
}

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
  let current = window.localStorage.getItem('current')

  // Stop task if running
  if (global.processes[current] && global.processes[current][task]) {
    global.processes[current][task].kill()
    return
  }

  let dir = window.localStorage.getItem('current')
  var command = spawn('grunt', [task], {cwd: dir})

  // Save
  if (!global.processes[current]) {
    global.processes[current] = {}
  }
  global.processes[current][task] = command

  cb()

  // Remove when done
  command.on('close', function (code, signal) {
    notifier.notify({
      title: 'Grunt ' + task,
      message: (!code) ? 'Done' : 'Error'
    })

    delete global.processes[current][task]
    cb()
  })
}

exports.stopAll = function () {
  for (let project in global.processes) {
    for (let p in global.processes[project]) {
      global.processes[project][p].kill()
    }
  }

  global.processes = {}
}
