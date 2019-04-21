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

util.inherits(ChannelOfflineEventHandler, EventHandler)

function ChannelOfflineEventHandler () {
  this.name = arguments.callee.name
}

ChannelOfflineEventHandler.prototype.eventName = EVENTS.CHANNEL_OFFLINE

ChannelOfflineEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}`, `request info is invalid`)
    return
  }

  var socketServer = this.globalContext['socketServer']
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']
  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  var channelIds = await storageService.getAllChannelIds(uid)

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

  channelIds.forEach(ciid => {
    socketServer.of('/').adapter.remoteLeave(socket.id, ciid)
  })
}

ChannelOfflineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new ChannelOfflineEventHandler()
}
