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

const CONVERSATION_SENT_SUCCESS = RES_META.CONVERSATION_SENT_SUCCESS
var respondErr = RES_META.SAVE_CONVERSATION_ERR

util.inherits(SendConversationEventHandler, EventHandler)

function SendConversationEventHandler () {
  this.name = arguments.callee.name
}

SendConversationEventHandler.prototype.eventName = EVENTS.SEND_CONVERSATION

SendConversationEventHandler.prototype.handle = async function (requestInfo) {
  var storageService = this.globalContext.storageService
  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var chid = packet.chid
  var uid = packet.uid
  var content = packet.content
  var convType = packet.convType

  if (socket.rooms[chid] === undefined) {
    return
  }

  var datetime = Date.now()
  var responseHeader = {
    to: TO.CHANNEL,
    receiver: chid,
    responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
  }

  this.executeSend(datetime, requestInfo, responseHeader)

  try {
    await storageService.conversationCreated(chid, uid, content, convType, datetime)
  } catch (err) {
    this.alertException(respondErr(err), requestInfo, responseHeader)
  }
}

SendConversationEventHandler.prototype.executeSend = function (datetime, requestInfo, responseHeader) {
  var businessEvent = this.globalContext.businessEvent
  var packet = requestInfo.packet
  var chid = packet.chid
  var uid = packet.uid
  var content = packet.content
  var type = packet.convType

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader(responseHeader)
    .responsePacket({
      // apply "chid" to make things easy at frontend
      chid,
      sender: uid,
      content,
      type,
      datetime
    }, CONVERSATION_SENT_SUCCESS)
    .responseMsg(`conversation sent as type: ${type}`)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

module.exports = {
  handler: new SendConversationEventHandler()
}
