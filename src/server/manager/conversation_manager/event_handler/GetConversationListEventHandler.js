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

const CONVERSATION_LIST_INFO = RES_META.CONVERSATION_LIST_INFO
const GET_CONVERSATION_LIST_SUCCESS = RES_META.GET_CONVERSATION_LIST_SUCCESS
var respondErr = RES_META.GET_CONVERSATION_LIST_ERR

util.inherits(GetConversationEventHandler, EventHandler)

function GetConversationEventHandler () {
  this.name = arguments.callee.name
}

GetConversationEventHandler.prototype.eventName = EVENTS.GET_CONVERSATION_LIST

GetConversationEventHandler.prototype.handle = function (requestInfo) {
  var storageService = this.globalContext.storageService
  var packet = requestInfo.packet

  Promise.resolve(storageService.getConversationList(packet.uid, packet.chid, packet.convLimit, packet.convSkip))
    .then(conversationList => this.sendConversationList(conversationList, requestInfo),
      err => this.alertException(respondErr(err), requestInfo))
}

GetConversationEventHandler.prototype.sendConversationList = function (conversationList, requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  var packet = requestInfo.packet
  var {
    uid,
    chid,
    convLimit,
    convSkip
  } = packet

  var meta = CONVERSATION_LIST_INFO
  if (conversationList.length !== 0) {
    meta = GET_CONVERSATION_LIST_SUCCESS
    meta.msg = `get conversations from ${convSkip} to ${convSkip + convLimit}`
  }

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_LIST
    })
    // .setPacket({
    //   msgCode: `get conversations from ${convSkip} to ${convSkip + convLimit}`,
    //   data: {
    //     chid,
    //     list: conversationList
    //   }
    // })
  /**
   * TODO: 重命名？
   */
    .responsePacket({
      chid,
      list: conversationList
    }, meta)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

module.exports = {
  handler: new GetConversationEventHandler()
}
