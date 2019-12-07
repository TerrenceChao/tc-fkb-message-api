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

const CHANNEL_OFFLINE_INFO = RES_META.CHANNEL_OFFLINE_INFO
var respondErr = RES_META.CHANNEL_OFFLINE_ERR

util.inherits(ChannelOfflineEventHandler, EventHandler)

function ChannelOfflineEventHandler () {
  this.name = arguments.callee.name
}

ChannelOfflineEventHandler.prototype.eventName = EVENTS.CHANNEL_OFFLINE

ChannelOfflineEventHandler.prototype.handle = function (requestInfo) {
  var storageService = this.globalContext.storageService
  var uid = requestInfo.packet.uid

  Promise.resolve(storageService.getAllChannelIds(uid))
    .then(channelIds => this.leaveChannels(channelIds, requestInfo),
      err => this.alertException(respondErr(err), requestInfo))
}

ChannelOfflineEventHandler.prototype.leaveChannels = function (channelIds, requestInfo) {
  if (channelIds.length === 0) {
    return
  }

  this.broadcast(channelIds, requestInfo)
  // // var socket = requestInfo.socket
  // // channelIds.forEach(chid => {
  // //   socketServer.of('/').adapter.remoteLeave(socket.id, chid)
  // // })
  // socketService.collectiveLeave(socket.id, channelIds)
  this.globalContext.socketService.offlineChannelList(
    requestInfo.packet.uid,
    channelIds
  )
}

ChannelOfflineEventHandler.prototype.broadcast = function (channelIds, requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  var uid = requestInfo.packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: channelIds,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .responsePacket({ uid }, CHANNEL_OFFLINE_INFO)
    .responseMsg(`user: ${uid} is offline`)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

module.exports = {
  handler: new ChannelOfflineEventHandler()
}
