var config = require('config')
var path = require('path')
const express = require('express')
const routeIndex = express.Router()
const {
  BUSINESS_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
let globalContext = require(path.join(config.get('src.manager'), 'globalContext'))

/**
 * ===========================================================
 * server push:
 * check main-app => src => services => messageService
 * ===========================================================
 */
var authService = globalContext.authService
var businessEvent = globalContext.businessEvent
const TOKEN = config.get('auth.token')

routeIndex.get(`/index`, (req, res, next) => {
  var url = `${req.protocol}://${req.get('host')}/${req.originalUrl}`
  console.log(`url: ${url}`)
  res.send({
    a: 1,
    b: 2,
    url
  })
})

routeIndex.get(`/${BUSINESS_EVENTS.AUTHENTICATE}`, (req, res, next) => {
  var token = authService.obtainAuthorization(req.headers)
  res.send({
    [TOKEN]: token
  })
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
