'use strict'
const grunt = require('gruntfile-api')
const fs = require('fs')
const gruntfile = fs.readFileSync('')

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
