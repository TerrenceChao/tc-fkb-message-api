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

const USER_ONLINE_INFO = RES_META.USER_ONLINE_INFO

util.inherits(UserOnlineEventHandler, EventHandler)

function UserOnlineEventHandler () {
  this.name = arguments.callee.name
}

UserOnlineEventHandler.prototype.eventName = EVENTS.USER_ONLINE

UserOnlineEventHandler.prototype.handle = function (requestInfo) {
  var socketService = this.globalContext.socketService
  var businessEvent = this.globalContext.businessEvent
  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  // socketServer.of('/').adapter.remoteJoin(socket.id, uid)
  // socketService.join(socket.id, uid)
  socketService.associateUser(socket.id, uid)

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.PERSONAL_INFO
    })
    .responsePacket({ uid }, USER_ONLINE_INFO)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

module.exports = {
  handler: new UserOnlineEventHandler()
}
