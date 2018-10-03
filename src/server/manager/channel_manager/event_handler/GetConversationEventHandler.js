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

util.inherits(GetConversationEventHandler, EventHandler)

function GetConversationEventHandler () {
  this.name = arguments.callee.name
}

GetConversationEventHandler.prototype.eventName = EVENTS.GET_CONVERSATION

GetConversationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var {
    uid,
    ciid,
    limit,
    skip
  } = packet

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  var conversations = await storageService.getConversationList(ciid, limit, skip)
  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_LIST
    })
    .setPacket({
      msgCode: `get conversations from ${skip} to ${skip + limit}`,
      data: conversations
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetConversationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined && this.isAuthenticated(packet) &&
    typeof packet.uid === 'string' &&
    packet.ciid != null &&
    packet.limit != null &&
    packet.skip != null
}

module.exports = {
  handler: new GetConversationEventHandler()
}
