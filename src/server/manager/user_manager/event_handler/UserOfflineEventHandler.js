var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

const USER_OFFLINE_INFO = RES_META.USER_OFFLINE_INFO

util.inherits(UserOfflineEventHandler, EventHandler)

function UserOfflineEventHandler () {
  this.name = arguments.callee.name
}

UserOfflineEventHandler.prototype.eventName = EVENTS.USER_OFFLINE

UserOfflineEventHandler.prototype.handle = function (requestInfo) {
  var socketService = this.globalContext.socketService
  var businessEvent = this.globalContext.businessEvent
  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.PERSONAL_INFO
    })
    .responsePacket({ uid }, USER_OFFLINE_INFO)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

  // socketServer.of('/').adapter.remoteLeave(socket.id, uid)
  // socketService.leave(socket.id, uid)
  socketService.dissociateUser(socket.id, uid)
}

module.exports = {
  handler: new UserOfflineEventHandler()
}
