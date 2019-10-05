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

const GET_ONE_CHANNEL_SUCCESS = RES_META.GET_ONE_CHANNEL_SUCCESS
var respondErr = RES_META.GET_ONE_CHANNEL_ERR

util.inherits(GetOneChannelEventHandler, EventHandler)

function GetOneChannelEventHandler() {
  this.name = arguments.callee.name
}

GetOneChannelEventHandler.prototype.eventName = EVENTS.GET_ONE_CHANNEL

GetOneChannelEventHandler.prototype.handle = function (requestInfo) {
  // if (!this.isValid(requestInfo)) {
  //   console.warn(`${this.eventName}: request info is invalid.`)
  //   return
  // }

  var storageService = this.globalContext['storageService']
  var uid = requestInfo.packet.uid
  var chid = requestInfo.packet.chid

  Promise.resolve(storageService.getUserChannelInfo({ uid, chid }))
    .then(channelInfo => this.sendChInfo(channelInfo, requestInfo),
      err => this.alertException(respondErr(err), requestInfo))
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
    // .setPacket({
    //   msgCode: `get a specified channel`,
    //   data: channelInfo
    // })
    .responsePacket(channelInfo, GET_ONE_CHANNEL_SUCCESS)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

// GetOneChannelEventHandler.prototype.isValid = function (requestInfo) {
//   var packet = requestInfo.packet
//   return packet !== undefined &&
//     typeof packet.uid === 'string' &&
//     typeof packet.chid === 'string'
// }

module.exports = {
  handler: new GetOneChannelEventHandler()
}
