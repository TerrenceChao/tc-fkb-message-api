var config = require('config')
var path = require('path')
var fs = require('fs')
const {
  REQUEST_EVENTS,
  BUSINESS_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
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
  const businessEvent = this.globalContext['businessEvent']
  const thisManager = this

  businessEvent.on(handler.eventName, (requestInfo) => {
    // console.log(` => listenBusinessEvent: handler is ${JSON.stringify(handler, null, 2)}`)
    handler.handle(requestInfo)
    thisManager.receiveAlert(handler.eventName, requestInfo)
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
  const authService = this.globalContext['authService']
  const thisManager = this

  const {
    req,
    res,
    socket
  } = protocol
  let requestInfo = new RequestInfo()

  // client request
  if (socket !== undefined) {
    socket.on(handler.eventName, (packet) => {
      // console.time('cycle')
      // console.time('auth')
      if (handler.eventName !== REQUEST_EVENTS.EXTEND_VALIDITY && authService.isAuthenticated(packet) === false) {
        console.warn(`${handler.eventName}: token validation fail`)
        return
      }
      // console.timeEnd('auth')
      requestInfo.socket = socket
      requestInfo.packet = packet
      handler.handle(requestInfo)
      // thisManager.receiveAlert(handler.eventName, requestInfo)
    })
  // internal service request
  } else if (req !== undefined && res !== undefined) {
    requestInfo.req = req
    requestInfo.res = res
    handler.handle(requestInfo)
    thisManager.receiveAlert(handler.eventName, requestInfo)
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
  let dir = path.join(this.rootDir, 'event_handler')

  let eventHandlers = []
  let eventContent = new Set()
  for (let key in events) {
    eventContent.add(events[key])
  }

  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    let {
      handler
    } = require(path.join(dir, file))
    if (eventContent.has(handler.eventName)) {
      eventHandlers.push(handler)
    }
  })

  return eventHandlers
}

// for testing
Manager.prototype.getEventHandler = function (eventName) {
  if (this.businessEventHandlers) {
    for (let index in this.businessEventHandlers) {
      let handler = this.businessEventHandlers[index]
      if (handler.eventName === eventName) {
        return handler
      }
    }
  }

  if (this.requestEventHandlers) {
    for (let index in this.requestEventHandlers) {
      let handler = this.requestEventHandlers[index]
      if (handler.eventName === eventName) {
        return handler
      }
    }
  }
}

// for testing
Manager.prototype.testing = function (receivedEvent) {
  this.receivedEvent = receivedEvent
  return this
}

Manager.prototype.receiveAlert = function (event, requestInfo) {
  if (this.receivedEvent) {
    this.receivedEvent.emit(event, requestInfo)
  }
}

module.exports = Manager
