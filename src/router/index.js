var config = require('config')
var path = require('path')
var uuidv4 = require('uuid/v4')
var express = require('express')
var routeIndex = express.Router()
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))

const BUSINESS_EVENTS = require(path.join(config.get('src.property'), 'property')).BUSINESS_EVENTS
const TOKEN = config.get('auth.token')
const REFRESH_TOKEN = config.get('auth.refreshToken')


routeIndex.get(`/index`, (req, res, next) => {
  res.send({
    msgCode: '000000',
    msg: 'ok',
    data: {
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    }
  })
})

routeIndex.get(`/${BUSINESS_EVENTS.AUTHENTICATE}`, (req, res, next) => {
  try {
    var token = globalContext.authService.obtainAuthorization(req.headers)
    // var secret = uuidv4()
    // var refreshToken = authService.obtainValidCert(req.headers, secret)
    // globalContext.storageService.saveUserValidateInfo(req.headers.uid, secret)

    res.send({
      // [REFRESH_TOKEN]: refreshToken,
      [TOKEN]: token
    })
  } catch (err) {
    console.error(err.message)

    var body = {
      msgCode: `cannot get token`
    }
    res.writeHead(500, {
      'Content-Length': Buffer.byteLength(body),
      'Content-Type': 'text/plain'
    })
      .end(body)
  }
})

/**
 * ===========================================================
 * push notification:
 * folk-api => notify-api => message-api(here)
 * ===========================================================
 */
routeIndex.post(`/${BUSINESS_EVENTS.PUSH_NOTIFICATION}`, (req, res, next) => {
  let requestInfo = new RequestInfo()
  requestInfo.req = req
  requestInfo.res = res
  requestInfo.packet = req.body

  globalContext.businessEvent.emit(BUSINESS_EVENTS.PUSH_NOTIFICATION, requestInfo)
})

module.exports = routeIndex
