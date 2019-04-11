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

util.inherits(CreateChannelEventHandler, EventHandler)

function CreateChannelEventHandler () {
  this.name = arguments.callee.name
}

CreateChannelEventHandler.prototype.eventName = EVENTS.CREATE_CHANNEL

CreateChannelEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var socket = requestInfo.socket
  var uid = packet.uid
  var channelName = packet.channelName

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)

  var socketServer = this.globalContext['socketServer']
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  // 'return null' if channelInfo had has been created.
  var channelInfo = await storageService.channelInfoCreated(uid, channelName)
  if (channelInfo == null) {
    resInfo = this.packException(packet, resInfo)
  } else {
    resInfo = this.pack(channelInfo, resInfo)
    socketServer.of('/').adapter.remoteJoin(socket.id, channelInfo.ciid)
  }

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

CreateChannelEventHandler.prototype.pack = function (channelInfo, responseInfo) {
  return responseInfo.setHeader({
    to: TO.CHANNEL,
    receiver: channelInfo.ciid,
    responseEvent: RESPONSE_EVENTS.CHANNEL_CREATED
  }).setPacket({
    msgCode: `channel: ${channelInfo.name} is created`,
    data: channelInfo
  })
}

CreateChannelEventHandler.prototype.packException = function (packet, responseInfo) {
  return responseInfo.setHeader({
    to: TO.USER,
    receiver: packet.uid,
    responseEvent: RESPONSE_EVENTS.EXCEPTION_ALERT
  }).setPacket({
    msgCode: `channel: ${packet.channelName} is failed to create or has been created`,
    data: false
  })
}

CreateChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.channelName === 'string' &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new CreateChannelEventHandler()
}
