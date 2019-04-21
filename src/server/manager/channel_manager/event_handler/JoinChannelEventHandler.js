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

util.inherits(JoinChannelEventHandler, EventHandler)

function JoinChannelEventHandler () {
  this.name = arguments.callee.name
}

JoinChannelEventHandler.prototype.eventName = EVENTS.JOIN_CHANNEL

JoinChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var chid = requestInfo.packet.chid

  Promise.resolve(storageService.getChannelInfo({
    chid
  }))
    .then(channelInfo => this.executeJoin(channelInfo, requestInfo),
      err => this.alertException(err.message, requestInfo))
    .catch(err => this.alertException(err.message, requestInfo))
}

JoinChannelEventHandler.prototype.executeJoin = async function (channelInfo, requestInfo) {
  var storageService = this.globalContext['storageService']
  var socketServer = this.globalContext['socketServer']
  var packet = requestInfo.packet
  var socket = requestInfo.socket
  var uid = packet.uid
  var chid = packet.chid

  await storageService.channelJoined(uid, chid)
  socketServer.of('/').adapter.remoteJoin(socket.id, channelInfo.ciid)

  this.notifyUserIsJoinedInChannel(channelInfo.ciid, requestInfo)
  this.sendChannelInfoToUser(channelInfo, requestInfo)
}

JoinChannelEventHandler.prototype.notifyUserIsJoinedInChannel = function (ciid, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var uid = packet.uid
  var firstName = packet.firstName

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: ciid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL // notify in channel
    })
    .setPacket({
      msgCode: `${firstName} is joined`,
      data: {
        uid,
        datetime: Date.now()
      } // refresh members NOW: add uid to channel.members(array), remove uid from channel.invitees(array) for "each member" in localStorage (frontend)
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

JoinChannelEventHandler.prototype.sendChannelInfoToUser = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var uid = requestInfo.packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.z // to user self
    })
    .setPacket({
      msgCode: `get channelinfo. including name, chid, ciid, creator, members`,
      data: {
        uid,
        channelInfo
      }
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

JoinChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.firstName === 'string' &&
    typeof packet.chid === 'string'
}

module.exports = {
  handler: new JoinChannelEventHandler()
}
