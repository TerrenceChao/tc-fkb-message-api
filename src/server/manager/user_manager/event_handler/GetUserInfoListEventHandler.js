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

const GET_USER_INFO_LIST_INFO = RES_META.GET_USER_INFO_LIST_INFO
var getUserInfoListErr = RES_META.GET_USER_INFO_LIST_DB_ERR

util.inherits(GetUserInfoListEventHandler, EventHandler)

function GetUserInfoListEventHandler () {
  this.name = arguments.callee.name
}

GetUserInfoListEventHandler.prototype.eventName = EVENTS.GET_USER_INFO_LIST

GetUserInfoListEventHandler.prototype.handle = function (requestInfo) {
  var storageService = this.globalContext.storageService
  var packet = requestInfo.packet
  var uidList = packet.uidList

  Promise.resolve(storageService.getUserInfoList(uidList))
    .then(userList => this.response(userList, requestInfo))
    .catch(err => this.alertException(getUserInfoListErr(err), requestInfo))
}

GetUserInfoListEventHandler.prototype.response = function (userList, requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  var packet = requestInfo.packet
  var uid = packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.USER_MAPPING_LIST
    })
    .responsePacket({ list: userList }, GET_USER_INFO_LIST_INFO)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

module.exports = {
  handler: new GetUserInfoListEventHandler()
}
