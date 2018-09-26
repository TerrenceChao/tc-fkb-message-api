var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
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
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var chid = packet.chid

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  if (await storageService.channelLeaved(uid, chid)) {
    var channelInfo = await storageService.getChannelInfo({
      chid
    })
    var ciid = channelInfo.ciid

    var resInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.CHANNEL,
        receiver: ciid,
        responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
      })
      .setPacket({
        msgCode: `${uid} is leaved`,
        data: [uid] // delete uid from channel.members(array) for "each member" in localStorage (frontend)
      })
    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

    requestInfo.socket.leave(ciid)
  }
}

LeaveChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.chid != null
}

module.exports = {
  handler: new LeaveChannelEventHandler()
}
