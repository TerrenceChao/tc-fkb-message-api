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

util.inherits(GetChannelListEventHandler, EventHandler)

function GetChannelListEventHandler () {
  this.name = arguments.callee.name
}

GetChannelListEventHandler.prototype.eventName = EVENTS.GET_CHANNEL_LIST

GetChannelListEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var limit = packet.chanLimit
  var skip = packet.chanSkip

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']
  var userChannelInfoList = await storageService.getUserChannelInfoList(uid, limit, skip)

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_LIST
    })
    .setPacket({
      msgCode: `channel list`,
      data: userChannelInfoList
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetChannelListEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.chanLimit != null
}

module.exports = {
  handler: new GetChannelListEventHandler()
}
