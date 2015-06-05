'use strict'
const grunt = require('gruntfile-api')
const fs = require('fs')
const path = require('path')
const spawn = require('child_process').spawn
const gruntfile = fs.readFileSync(path.join(window.localStorage.getItem('current'), 'Gruntfile.js'))

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

exports.runTask = function (task) {
  let dir = window.localStorage.getItem('current')
  var command = spawn('grunt', [task], {cwd: dir})

  let execTask = 'grunt_' + task

  // Save to sessionStorage
  let list = JSON.parse(window.sessionStorage.getItem('processes'))
  window.sessionStorage.setItem('processes', JSON.stringify(list))

  // Remove from storage when finished
  command.on('close', function () {
    let list = JSON.parse(window.sessionStorage.getItem('processes'))
    window.sessionStorage.setItem('processes', JSON.stringify(list))
  })
}

exports.exitTask = function (command) {
  command.kill()
}
