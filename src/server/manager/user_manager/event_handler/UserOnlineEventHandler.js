var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(UserOnlineEventHandler, EventHandler)

function UserOnlineEventHandler () {
  this.name = arguments.callee.name
}

UserOnlineEventHandler.prototype.eventName = EVENTS.USER_ONLINE

UserOnlineEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var socketServer = this.globalContext['socketServer']
  var businessEvent = this.globalContext['businessEvent']
  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  socketServer.of('/').adapter.remoteJoin(socket.id, uid)

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.PERSONAL_INFO
    })
    .setPacket({
      msgCode: `user is online`,
      uid
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

UserOnlineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new UserOnlineEventHandler()
}
