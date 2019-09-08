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

ChannelOfflineEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}`, `request info is invalid`)
    return
  }

  var storageService = this.globalContext['storageService']
  var uid = requestInfo.packet.uid

  Promise.resolve(storageService.getAllChannelIds(uid))
    .then(channelIds => this.leaveChannels(channelIds, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

ChannelOfflineEventHandler.prototype.leaveChannels = function (channelIds, requestInfo) {
  this.broadcast(channelIds, requestInfo)

  var socketService = this.globalContext['socketService']
  // // var socket = requestInfo.socket
  // // channelIds.forEach(chid => {
  // //   socketServer.of('/').adapter.remoteLeave(socket.id, chid)
  // // })
  // socketService.collectiveLeave(socket.id, channelIds)
  var uid = requestInfo.packet.uid
  socketService.offlineChannelList(uid, channelIds)
}

ChannelOfflineEventHandler.prototype.broadcast = function (channelIds, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var uid = requestInfo.packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: channelIds,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `user: ${uid} is offline`,
      data: {
        uid
      }
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

ChannelOfflineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new ChannelOfflineEventHandler()
}
