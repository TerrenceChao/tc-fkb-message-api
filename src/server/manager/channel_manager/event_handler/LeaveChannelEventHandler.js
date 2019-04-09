var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('property'), 'property'))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(LeaveChannelEventHandler, EventHandler)

function LeaveChannelEventHandler () {
  this.name = arguments.callee.name
}

LeaveChannelEventHandler.prototype.eventName = EVENTS.LEAVE_CHANNEL

LeaveChannelEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var chid = packet.chid

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  if (await storageService.channelLeaved(uid, chid)) {
    var query = {
      chid
    }
    var channelInfo = await storageService.getChannelInfo(query)
    if (channelInfo == null) {
      this.packException(packet, requestInfo)
      return
    }

    var ciid = channelInfo.ciid
    var resInfo = this.pack(ciid, uid, requestInfo)
    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

    if (channelInfo.members.length === 0) {
      businessEvent.emit(BUSINESS_EVENTS.REMOVE_CHANNEL, requestInfo)
    }

    var socketServer = this.globalContext['socketServer']
    socketServer.of('/').adapter.remoteLeave(requestInfo.socket.id, ciid)
  }
}

LeaveChannelEventHandler.prototype.pack = function (ciid, uid, requestInfo) {
  return new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: ciid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `${uid} is leaved`,
      data: {
        uid,
        ciid,
        datetime: Date.now()
      } // delete uid from channel.members(array) for "each member" in localStorage (frontend)
    })
}

LeaveChannelEventHandler.prototype.packException = function (packet, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.EXCEPTION_ALERT // back to user
    })
    .setPacket({
      msgCode: `couldn't get channel info with chid:${packet.chid}`
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

LeaveChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.chid != null &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new LeaveChannelEventHandler()
}
