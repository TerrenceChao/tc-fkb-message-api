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

CreateChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var uid = requestInfo.packet.uid
  var channelName = requestInfo.packet.channelName

  Promise.resolve(storageService.channelInfoCreated(uid, channelName))
    .then(newChannelInfo => this.enterChannel(newChannelInfo, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

CreateChannelEventHandler.prototype.enterChannel = function (channelInfo, requestInfo) {
  var socketServer = this.globalContext['socketServer']
  var socket = requestInfo.socket

  socketServer.of('/').adapter.remoteJoin(socket.id, channelInfo.ciid)
  this.sendChannelInfoToUser(channelInfo, requestInfo)
}

CreateChannelEventHandler.prototype.sendChannelInfoToUser = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo).setHeader({
      to: TO.USER,
      receiver: channelInfo.creator,
      responseEvent: RESPONSE_EVENTS.CHANNEL_CREATED
    }).setPacket({
      msgCode: `channel: ${channelInfo.name} is created`,
      data: channelInfo
    })
  
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

CreateChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.channelName === 'string'
}

module.exports = {
  handler: new CreateChannelEventHandler()
}
