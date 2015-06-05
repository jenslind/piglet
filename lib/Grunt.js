'use strict'
const grunt = require('gruntfile-api')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const gruntfile = fs.readFileSync(path.join(window.localStorage.getItem('current'), 'Gruntfile.js'))

global.processes = {}

exports.getTasks = function () {
  return new Promise(function (resolve, reject) {
    grunt.init(gruntfile)
    let tasks = JSON.parse(grunt.getJsonTasks())

    let taskList = []

    for (let task in tasks) {
      taskList.push(task)
    }

    return resolve(taskList)
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
  command.on('close', function () {
    delete global.processes[task]
    cb()
  })
}
