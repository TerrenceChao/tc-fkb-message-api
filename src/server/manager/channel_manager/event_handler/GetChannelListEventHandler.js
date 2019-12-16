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

const CHANNEL_LIST_INFO = RES_META.CHANNEL_LIST_INFO
const GET_CHANNEL_LIST_SUCCESS = RES_META.GET_CHANNEL_LIST_SUCCESS
var respondErr = RES_META.GET_CHANNEL_LIST_ERR

util.inherits(GetChannelListEventHandler, EventHandler)

function GetChannelListEventHandler () {
  this.name = arguments.callee.name
}

GetChannelListEventHandler.prototype.eventName = EVENTS.GET_CHANNEL_LIST

GetChannelListEventHandler.prototype.handle = function (requestInfo) {
  var storageService = this.globalContext.storageService

  var packet = requestInfo.packet
  var uid = packet.uid
  var limit = packet.chanLimit
  var skip = packet.chanSkip

  Promise.resolve(storageService.getUserChannelInfoList(uid, limit, skip))
    .then(userChannelInfoList => this.sendChInfoListBelongedUser(userChannelInfoList, requestInfo),
      err => this.alertException(respondErr(err), requestInfo))
}

GetChannelListEventHandler.prototype.sendChInfoListBelongedUser = function (userChannelInfoList, requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  const META = userChannelInfoList.length === 0 ? CHANNEL_LIST_INFO : GET_CHANNEL_LIST_SUCCESS

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: requestInfo.packet.uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_LIST
    })
    .responsePacket({ list: userChannelInfoList }, META)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

module.exports = {
  handler: new GetChannelListEventHandler()
}
