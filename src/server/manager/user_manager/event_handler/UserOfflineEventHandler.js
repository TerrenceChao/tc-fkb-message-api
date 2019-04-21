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

util.inherits(UserOfflineEventHandler, EventHandler)

function UserOfflineEventHandler () {
  this.name = arguments.callee.name
}

UserOfflineEventHandler.prototype.eventName = EVENTS.USER_OFFLINE

UserOfflineEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}`, `request info is invalid`)
    return
  }

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  var storageService = this.globalContext['storageService']
  var channelIds = await storageService.getAllChannelIds(uid)

  var businessEvent = this.globalContext['businessEvent']

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: channelIds,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `user: ${uid} is offline`
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

  var socketServer = this.globalContext['socketServer']
  channelIds.forEach(ciid => {
    socketServer.of('/').adapter.remoteLeave(socket.id, ciid)
  })

  socketServer.of('/').adapter.remoteLeave(socket.id, uid)
  socket.disconnect(true)
}

UserOfflineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new UserOfflineEventHandler()
}
