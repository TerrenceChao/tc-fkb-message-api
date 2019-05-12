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

util.inherits(GetConversationEventHandler, EventHandler)

function GetConversationEventHandler () {
  this.name = arguments.callee.name
}

GetConversationEventHandler.prototype.eventName = EVENTS.GET_CONVERSATION

GetConversationEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var packet = requestInfo.packet

  Promise.resolve(storageService.getConversationList(packet.uid, packet.ciid, packet.convLimit, packet.convSkip))
    .then(conversationList => this.sendConversationList(conversationList, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

GetConversationEventHandler.prototype.sendConversationList = function (conversationList, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var {
    uid,
    ciid,
    convLimit,
    convSkip
  } = packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_LIST
    })
    .setPacket({
      msgCode: `get conversations from ${convSkip} to ${convSkip + convLimit}`,
      data: {
        ciid,
        list: conversationList
      }
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetConversationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.ciid != null &&
    packet.convLimit != null &&
    packet.convSkip != null
}

module.exports = {
  handler: new GetConversationEventHandler()
}
