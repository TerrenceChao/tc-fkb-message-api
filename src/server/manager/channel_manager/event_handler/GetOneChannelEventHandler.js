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

util.inherits(GetOneChannelEventHandler, EventHandler)

function GetOneChannelEventHandler() {
  this.name = arguments.callee.name
}

GetOneChannelEventHandler.prototype.eventName = EVENTS.GET_ONE_CHANNEL

GetOneChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var uid = requestInfo.packet.uid
  var chid = requestInfo.packet.chid
  var ciid = requestInfo.packet.ciid

  Promise.resolve(storageService.getUserChannelInfo({ uid, chid, ciid }))
    .then(channelInfo => this.sendChInfo(channelInfo, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

GetOneChannelEventHandler.prototype.sendChInfo = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: requestInfo.packet.uid,
      responseEvent: RESPONSE_EVENTS.SPECIFIED_CHANNEL
    })
    .setPacket({
      msgCode: `get a specified channel`,
      data: channelInfo
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetOneChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.chid === 'string'
}

module.exports = {
  handler: new GetOneChannelEventHandler()
}
