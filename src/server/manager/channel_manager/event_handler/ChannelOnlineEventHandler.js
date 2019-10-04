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

const CHANNEL_ONLINE_INFO = RES_META.CHANNEL_ONLINE_INFO
var respondErr = RES_META.CHANNEL_ONLINE_ERR


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
      err => this.alertException(respondErr(err), requestInfo))
}

ChannelOnlineEventHandler.prototype.joinChannels = function (channelIds, requestInfo) {
  if (channelIds.length === 0) {
    return
  }

  // var socket = requestInfo.socket
  // // channelIds.forEach(chid => {
  // //   socketServer.of('/').adapter.remoteJoin(socket.id, chid)
  // // })
  // socketService.collectiveJoin(socket.id, channelIds)
  this.globalContext['socketService'].onlineChannelList(
    requestInfo.packet.uid,
    channelIds
  )

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
    .responsePacket({ uid }, CHANNEL_ONLINE_INFO)
    .responseMsg(`user: ${uid} is online`)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

ChannelOnlineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new ChannelOnlineEventHandler()
}
