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

util.inherits(ChannelOnlineEventHandler, EventHandler)

function ChannelOnlineEventHandler () {
  this.name = arguments.callee.name
}

ChannelOnlineEventHandler.prototype.eventName = EVENTS.CHANNEL_ONLINE

ChannelOnlineEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var uid = requestInfo.packet.uid

  Promise.resolve(storageService.getAllChannelIds(uid))
    .then(channelIds => this.joinChannels(channelIds, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

ChannelOnlineEventHandler.prototype.joinChannels = function (channelIds, requestInfo) {
  var socketServer = this.globalContext['socketServer']
  var socket = requestInfo.socket
  channelIds.forEach(ciid => {
    socketServer.of('/').adapter.remoteJoin(socket.id, ciid)
  })

  this.broadcast(channelIds, requestInfo)
}

ChannelOnlineEventHandler.prototype.broadcast = function (channelIds, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var uid = packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: channelIds,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `user: ${uid} is online`
    })
  
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

ChannelOnlineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new ChannelOnlineEventHandler()
}
