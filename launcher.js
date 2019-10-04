'use strict'

var cluster = require('cluster')
var os = require('os')

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`)

  for (var i = 0; i < os.cpus().length; i++) {
    cluster.fork().on('listening', function (address) {
      console.log(`worker is listening on port: ${address.port}`)
    })
  }

  cluster.on('exit', function (worker, code, signal) {
    console.log(`worker ${worker.process.pid} died`)
    if (signal) {
      console.log(`worker was killed by signal: ${signal}`)
    } else if (code !== 0) {
      console.log(`worker exited with error code: ${code}`)
    }
  })
}

if (cluster.isWorker) {
  console.log(`Worker ${process.pid} started`)

  var config = require('config')
  var path = require('path')
  var express = require('express')
  var logger = require('morgan')
  var cookieParser = require('cookie-parser')
  var bodyParser = require('body-parser')
  config.get('database.nosql.db').connect()

  var routeIndex = require(path.join(config.get('src.router'), 'index'))
  var {
    startUp
  } = require(path.join(config.get('src.server'), 'MessageServer'))

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

  var PORT = config.get('app.port')
  var port = parseInt(PORT) + cluster.worker.id
  var server = app
    .use(`/message-service/api/v1/`, routeIndex)
    .listen(port, () => console.log(`Listening on ${port}`))

  startUp(server)
}
