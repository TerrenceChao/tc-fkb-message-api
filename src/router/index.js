var config = require('config')
var path = require('path')
const uuidv4 = require('uuid/v4')
const express = require('express')
const routeIndex = express.Router()
const {
  BUSINESS_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
let globalContext = require(path.join(config.get('src.manager'), 'globalContext'))

const TOKEN = config.get('auth.token')
const REFRESH_TOKEN = config.get('auth.refreshToken')
/**
 * ===========================================================
 * server push:
 * check main-app => src => services => messageService
 * ===========================================================
 */

var authService = globalContext.authService
var storageService = globalContext.storageService
var businessEvent = globalContext.businessEvent

routeIndex.get(`/index`, (req, res, next) => {
  var url = `${req.protocol}://${req.get('host')}${req.originalUrl}`
  console.log(`url: ${url}`)
  res.send({
    a: 1,
    b: 2,
    url
  })
})

routeIndex.get(`/${BUSINESS_EVENTS.AUTHENTICATE}`, async (req, res, next) => {
  try {
    var token = authService.obtainAuthorization(req.headers)
    // var secret = uuidv4()
    // var refreshToken = authService.obtainValidCert(req.headers, secret)
    // await storageService.saveUserValidateInfo(req.headers.uid, secret)

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

routeIndex.post(`/${BUSINESS_EVENTS.SERVER_PUSH}`, (req, res, next) => {
  /**
   * messageManager...
   *  1. new post(s) coming;
   *  2. chat with friends without invitation:
   *      combine "createChannel" and "joinChannel" event handler;
   *  3. confirm/remove friend:
   *      it involves SQL(postgreSQL) update, and need to change both client site(skt);
   *  4. send channel/friend invitation;
   *  5. receive conversations of each channel.
   *
   *  (Its not available for now.)
   *  6. "cancel" channel/friend invitation;
   */
  // const protocol = { req, res };
  // let handler = messageManager.getEventHandler(BUSINESS_EVENTS.SERVER_PUSH);
  // authenticationManager.listenRequestEvent(protocol, handler);
  let requestInfo = new RequestInfo()
  requestInfo.req = req
  requestInfo.res = res
  requestInfo.packet = req.body
  console.log(`requestInfo.packet: ${JSON.stringify(requestInfo.packet)}`)

  businessEvent.emit(BUSINESS_EVENTS.SERVER_PUSH, requestInfo)
})

module.exports = routeIndex
