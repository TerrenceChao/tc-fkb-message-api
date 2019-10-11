var config = require('config')
var util = require('util')
var path = require('path')

const {
  PROTOCOL,
  TO,
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
// var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(SendMessageEventHandler, EventHandler)

function SendMessageEventHandler () {
  this.name = arguments.callee.name
}

SendMessageEventHandler.prototype.eventName = EVENTS.SEND_MESSAGE

SendMessageEventHandler.prototype.handle = function (responseInfo) {
  // if (!this.isValid(responseInfo)) {
  //   console.warn(`${this.eventName}: response info is invalid.`)
  //   return
  // }

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
      switch (header.to) {
        case TO.BROADCAST:
          this.emitForBroadcast(responseInfo)
          break

        case TO.CHANNEL:
        case TO.USER:
          this.emitToChannel(responseInfo)
          break

        case TO.SOCKET:
          this.emitToSocket(responseInfo)
          break

        default:
          console.error(`${EVENTS.SEND_MESSAGE}:`, `there's nothing can provided.`)
      }
  }
}

SendMessageEventHandler.prototype.emitForBroadcast = function (responseInfo) {
  var socketService = this.globalContext['socketService']

  var header = responseInfo.header
  var packet = responseInfo.packet
  var responseEvent = header.responseEvent

  // socketServer.sockets.emit(responseEvent, packet)
  socketService.broadcast(responseEvent, packet)
  console.log(`${EVENTS.SEND_MESSAGE}:`, `broadcast to all.`, `responseEvent: "${responseEvent}"`, JSON.stringify(packet))
}

SendMessageEventHandler.prototype.emitToChannel = function (responseInfo) {
  var socketService = this.globalContext['socketService']

  var header = responseInfo.header
  var packet = responseInfo.packet
  var receiver = header.receiver
  var responseEvent = header.responseEvent

  if (Array.isArray(receiver) && receiver.length > 0) {
    receiver.forEach((r) => {
      socketService.emitInChannel(r, responseEvent, packet)
    })
    console.log(`"${EVENTS.SEND_MESSAGE}": {"emit to ${header.to}": ${JSON.stringify(receiver, null, 2)}, "responseEvent": "${responseEvent}"}`, `, "packet": ${JSON.stringify(packet, null, 2)},`)
  } else if (typeof receiver === 'string') {
    socketService.emitInChannel(receiver, responseEvent, packet)
    console.log(`"${EVENTS.SEND_MESSAGE}": {"emit to ${header.to}": ${JSON.stringify(receiver, null, 2)}, "responseEvent": "${responseEvent}"}`, `, "packet": ${JSON.stringify(packet, null, 2)},`)
  } else {
    console.error(`${EVENTS.SEND_MESSAGE}:`, `type of receiver is unknown or invalid:`, receiver)
  }
}

SendMessageEventHandler.prototype.emitToSocket = function (responseInfo) {
  var responseEvent = responseInfo.header.responseEvent

  if (responseInfo.socket == null) {
    console.log(`${EVENTS.SEND_MESSAGE}:`, `socket is undefined.`)
    return
  }

  responseInfo.socket.emit(responseEvent, responseInfo.packet)
  console.log(`${EVENTS.SEND_MESSAGE}:`, `emit to socket`, `responseEvent: "${responseEvent}"`, JSON.stringify(responseInfo.packet))
}

// SendMessageEventHandler.prototype.emitInChannel = function (channel, responseEvent, packet) {
//   var socketServer = this.globalContext['socketServer']
//   if (Array.isArray(responseEvent)) {
//     responseEvent.forEach(resEvent => {
//       socketServer.sockets.in(channel).emit(resEvent, packet)
//     })
//   } else if (typeof responseEvent === 'string') {
//     socketServer.sockets.in(channel).emit(responseEvent, packet)
//   }
// }

// SendMessageEventHandler.prototype.isValid = function (responseInfo) {
//   return responseInfo instanceof ResponseInfo &&
//     responseInfo.header != null &&
//     typeof responseInfo.header.protocol === 'string' &&
//     typeof responseInfo.header.to === 'string' &&
//     (typeof responseInfo.header.receiver === 'string' || Array.isArray(responseInfo.header.receiver)) &&
//     (typeof responseInfo.header.responseEvent === 'string' || Array.isArray(responseInfo.header.responseEvent))
// }

module.exports = {
  handler: new SendMessageEventHandler()
}
