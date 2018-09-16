var config = require('config')
var util = require('util')
var path = require('path')

const {
  PROTOCOL,
  TO,
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(SendMessageEventHandler, EventHandler)

function SendMessageEventHandler () {
  this.name = arguments.callee.name
}

SendMessageEventHandler.prototype.eventName = EVENTS.SEND_MESSAGE

SendMessageEventHandler.prototype.handle = function (responseInfo) {
  if (!this.isValid(responseInfo)) {
    console.warn(`${this.eventName}:`, `response info is invalid.`)
    return
  }

  var header = responseInfo.header
  var packet = responseInfo.packet

  switch (header.protocol) {
    case PROTOCOL.HTTP:
      var res = responseInfo.res
      res.json(packet)
      console.log(`${EVENTS.SEND_MESSAGE} (server push):`, JSON.stringify(packet))
      break

    case PROTOCOL.SOCKET:
    default:
      var socketServer = this.globalContext['socketServer']
      var responseEvent = responseInfo.header.responseEvent
      if (responseEvent == null) {
        console.error(`${EVENTS.SEND_MESSAGE}:`, `responseEvent for socket's listener is undefined.`)
        return
      }

      switch (header.to) {
        case TO.BROADCAST:
          socketServer.sockets.emit(responseEvent, packet)
          console.log(`${EVENTS.SEND_MESSAGE}:`, `broadcast to all.`, `responseEvent: "${responseEvent}"`, JSON.stringify(packet))
          break

        case TO.CHANNEL:
        case TO.USER:
          var receiver = header.receiver

          if (Array.isArray(receiver)) {
            receiver.forEach((r) => {
              this.emitInChannel(r, responseEvent, packet)
            })
          } else if (typeof receiver === 'string') {
            this.emitInChannel(receiver, responseEvent, packet)
          } else {
            console.error(`${EVENTS.SEND_MESSAGE}:`, `type of receiver is unkonw or invalid`)
            return
          }

          console.log(`${EVENTS.SEND_MESSAGE}:`, `emit to ${header.to}: ${JSON.stringify(receiver)}`, `responseEvent: "${responseEvent}"`, JSON.stringify(packet))
          break

        case TO.SOCKET:
          var socket = responseInfo.socket

          if (socket == null) {
            console.log(`${EVENTS.SEND_MESSAGE}:`, `socket is undefined.`)
            return
          }

          socket.emit(responseEvent, packet)
          console.log(`${EVENTS.SEND_MESSAGE}:`, `emit to socket`, `responseEvent: "${responseEvent}"`, JSON.stringify(packet))
          break

        default:
          console.error(`${EVENTS.SEND_MESSAGE}:`, `there's nothing can provided.`)
      }
  }
}

SendMessageEventHandler.prototype.emitInChannel = function (channel, responseEvent, packet) {
  var socketServer = this.globalContext['socketServer']
  if (Array.isArray(responseEvent)) {
    responseEvent.forEach(resEvent => {
      socketServer.sockets.in(channel).emit(resEvent, packet)
    })
  } else if (typeof responseEvent === 'string') {
    socketServer.sockets.in(channel).emit(responseEvent, packet)
  }
}

SendMessageEventHandler.prototype.isValid = function (responseInfo) {
  return responseInfo instanceof ResponseInfo &&
    responseInfo.header != null &&
    typeof responseInfo.header.protocol === 'string' &&
    typeof responseInfo.header.to === 'string' &&
    (typeof responseInfo.header.receiver === 'string' || Array.isArray(responseInfo.header.receiver)) &&
    (typeof responseInfo.header.responseEvent === 'string' || Array.isArray(responseInfo.header.responseEvent))
}

module.exports = {
  handler: new SendMessageEventHandler()
}
