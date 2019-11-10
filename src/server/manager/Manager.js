var config = require('config')
var path = require('path')
var fs = require('fs')
const {
  REQUEST_EVENTS,
  BUSINESS_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var matchHttpRequestEvent = require(path.join(config.get('src.httpProtocol'), 'util')).matchRequestEvent
var validator = require(path.join(config.get('src.property'), 'validation')).ALL
var RequestInfo = require('./RequestInfo.js')

function Manager () {}

Manager.prototype.init = function (globalContext) {
  this.globalContext = globalContext

  const thisManager = this
  this.businessEventHandlers = this.getBusinessEventHandler()
  this.businessEventHandlers.forEach((handler) => {
    // console.log(` => init handler ${JSON.stringify(handler, null, 2)}`)
    thisManager.listenBusinessEvent(handler)
  })

  return this
}

Manager.prototype.listenBusinessEvent = function (handler) {
  handler.globalContext = this.globalContext
  const businessEvent = this.globalContext.businessEvent

  businessEvent.on(handler.eventName, (requestInfo) => {
    // console.log(` => listenBusinessEvent: handler is ${JSON.stringify(handler, null, 2)}`)

    // handler.handle(requestInfo)
    validator[handler.eventName](requestInfo) ? handler.handle(requestInfo) : console.error(`[business-event] ${handler.eventName}: request info is invalid.`)
  })
}

Manager.prototype.startListen = function (protocol) {
  const thisManager = this
  this.requestEventHandlers = this.getRequestEventHandler()
  this.requestEventHandlers.forEach((handler) => {
    // console.log(` => startListen handler ${JSON.stringify(handler, null, 2)}`)
    thisManager.listenRequestEvent(protocol, handler)
  })

  return this
}

Manager.prototype.listenRequestEvent = function (protocol, handler) {
  handler.globalContext = this.globalContext
  const authService = this.globalContext.authService

  const {
    req,
    res,
    next,
    socket
  } = protocol
  const requestInfo = new RequestInfo()

  // client request
  if (socket !== undefined) {
    socket.on(handler.eventName, (packet) => {
      if (handler.eventName !== REQUEST_EVENTS.EXTEND_VALIDITY && authService.isAuthenticated(packet) === false) {
        console.warn(`${handler.eventName}: token validation fail`)
        return
      }
      requestInfo.socket = socket
      requestInfo.packet = packet

      // handler.handle(requestInfo)
      validator[handler.eventName](requestInfo) ? handler.handle(requestInfo) : console.error(`[socket-request-event] ${handler.eventName}: request info is invalid.`)
    })
  // internal service request
  } else if (matchHttpRequestEvent(req, res, handler.eventName)) {
    requestInfo.req = req
    requestInfo.res = res
    requestInfo.next = next

    // handler.handle(requestInfo)
    validator[handler.eventName](requestInfo) ? handler.handle(requestInfo) : console.error(`[http-request-event] ${handler.eventName}: request info is invalid.`)
  }
}

Manager.prototype.getBusinessEventHandler = function () {
  // console.log(`\n[${this.name}] includes business event handlers:`);
  return this.loadEventHandler(BUSINESS_EVENTS)
}

Manager.prototype.getRequestEventHandler = function () {
  // console.log(`\n[${this.name}] includes business event handlers:`);
  return this.loadEventHandler(REQUEST_EVENTS)
}

Manager.prototype.loadEventHandler = function (events) {
  const dir = path.join(this.rootDir, 'event_handler')

  const eventHandlers = []
  const eventContent = new Set()
  for (const key in events) {
    eventContent.add(events[key])
  }

  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const {
      handler
    } = require(path.join(dir, file))
    if (eventContent.has(handler.eventName)) {
      eventHandlers.push(handler)
    }
  })

  return eventHandlers
}

module.exports = Manager
