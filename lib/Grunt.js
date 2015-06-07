'use strict'
const grunt = require('gruntfile-api')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const notifier = require('node-notifier')

global.processes = {}

exports.getTasks = function () {
  return new Promise(function (resolve, reject) {
    let current = window.localStorage.getItem('current')

    if (!current) return resolve([])

    fs.readFile(path.join(current, 'Gruntfile.js'), function (err, gruntfile) {
      if (err) return resolve([])

      grunt.init(gruntfile)
      let tasks = JSON.parse(grunt.getJsonTasks())

      let taskList = []

      for (let task in tasks) {
        taskList.push(task)
      }

      return resolve(taskList)
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
