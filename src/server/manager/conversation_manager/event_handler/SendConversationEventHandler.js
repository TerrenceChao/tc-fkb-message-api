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

util.inherits(SendConversationEventHandler, EventHandler)

function SendConversationEventHandler () {
  this.name = arguments.callee.name
}

SendConversationEventHandler.prototype.eventName = EVENTS.SEND_CONVERSATION

SendConversationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']

  var packet = requestInfo.packet
  var ciid = packet.ciid
  var uid = packet.uid
  var content = packet.content
  var convType = packet.convType
  var datetime = Date.now()
  var responseHeader = {
    to: TO.CHANNEL,
    receiver: ciid,
    responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
  }

  this.executeSend(datetime, requestInfo, responseHeader)

  try {
    if (requestInfo.socket.rooms[ciid]) {
      await storageService.conversationCreated(ciid, uid, content, convType, datetime)
    }
  } catch (err) {
    this.alertException(err.message, requestInfo, responseHeader)
  }
}

SendConversationEventHandler.prototype.executeSend = function (datetime, requestInfo, responseHeader) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var ciid = packet.ciid
  var uid = packet.uid
  var content = packet.content
  var type = packet.convType

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader(responseHeader)
    .setPacket({
      msgCode: `conversation type: ${type}`,
      data: {
        // apply "ciid" to make things easy at frontend
        ciid,
        sender: uid,
        content,
        type,
        datetime
      }
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

SendConversationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    packet.ciid != null &&
    typeof packet.uid === 'string' &&
    packet.content != null &&
    packet.convType != null
}

module.exports = {
  handler: new SendConversationEventHandler()
}
