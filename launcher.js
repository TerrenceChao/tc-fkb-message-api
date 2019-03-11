'use strict'

var cluster = require('cluster')
var os = require('os')

if (cluster.isMaster) {
  for (var i = 0; i < os.cpus().length; i++) {
    cluster.fork().on('listening', function (address) {
      console.log(`worker is listening on port: ${address.port}`)
    })
  }

  cluster.on('exit', function (worker, code, signal) {
    console.log(`worker ${worker.process.pid} died`)
  })
}

if (cluster.isWorker) {
  var config = require('config')
  var path = require('path')
  var express = require('express')
  var logger = require('morgan')
  var cookieParser = require('cookie-parser')
  var bodyParser = require('body-parser')

  var routeIndex = require(path.join(config.get('router'), 'index'))
  var {
    startUp
  } = require(path.join(config.get('server'), 'MessageServer'))

  var PORT = config.get('PORT')
  var port = parseInt(PORT) + cluster.worker.id

  var app = express()

  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: false
  }))
  app.use(cookieParser())

  app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    /**
     * Set to true if you need the website to include cookies in the requests sent
     * to the API (e.g. in case you use sessions)
     */
    res.setHeader('Access-Control-Allow-Credentials', true)

    next()
  })

  var server = app
    .use(`/message_service/v1/`, routeIndex)
    .listen(port, () => console.log(`Listening on ${port}`))

  startUp(server)
}