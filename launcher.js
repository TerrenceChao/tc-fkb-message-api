'use strict'

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

  // // Set to true if you need the website to include cookies in the requests sent
  // // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true)

  next()
})

var server = app
  .use(`/message_service/v1/`, routeIndex)
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

startUp(server)
