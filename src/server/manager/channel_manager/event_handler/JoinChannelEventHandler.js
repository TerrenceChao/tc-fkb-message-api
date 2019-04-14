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

JoinChannelEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var socket = requestInfo.socket
  var uid = packet.uid
  var chid = packet.chid

  var storageService = this.globalContext['storageService']

  var channelInfo = await storageService.getChannelInfo({
    chid
  })
  if (channelInfo == null) {
    this.alertException(`couldn't get channel info with chid: ${chid}`, requestInfo)
    return
  }

  if (await storageService.channelJoined(uid, chid)) {
    var socketServer = this.globalContext['socketServer']
    socketServer.of('/').adapter.remoteJoin(socket.id, channelInfo.ciid)
    this.notifyUserIsJoinedInChannel(channelInfo.ciid, requestInfo)
  } else {
    this.alertException(`join channel fail. uid: ${uid}`, requestInfo)
  }
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
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `${firstName} is joined`,
      data: {
        uid,
        datetime: Date.now()
      } // refresh members NOW: add uid to channel.members(array) for "each member" in localStorage (frontend)
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

JoinChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.firstName === 'string' &&
    typeof packet.chid === 'string' &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new JoinChannelEventHandler()
}
