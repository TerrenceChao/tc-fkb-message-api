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

util.inherits(SendConversationEventHandler, EventHandler)

function SendConversationEventHandler () {
  this.name = arguments.callee.name
}

SendConversationEventHandler.prototype.eventName = EVENTS.SEND_CONVERSATION

SendConversationEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var ciid = packet.ciid
  var convType = packet.convType
  var conversation = packet.conversation

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  var datetime = Date.now()
  storageService.conversationCreated(ciid, uid, conversation, convType, datetime)

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: ciid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `convType: ${convType}`,
      data: {
        uid,
        conversation,
        datetime
      }
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

SendConversationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.ciid != null &&
    packet.convType != null &&
    packet.conversation != null &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new SendConversationEventHandler()
}
