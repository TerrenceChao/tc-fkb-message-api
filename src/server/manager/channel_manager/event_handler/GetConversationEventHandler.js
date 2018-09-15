var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  RESPONSE_EVENTS,
  REQUEST_EVENTS,
  BUSINESS_EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(GetConversationEventHandler, EventHandler)

function GetConversationEventHandler() {
  this.name = arguments.callee.name
}

GetConversationEventHandler.prototype.eventName = REQUEST_EVENTS.GET_CONVERSATION

GetConversationEventHandler.prototype.handle = async function (requestInfo) {

}

module.exports = {
  handler: new GetConversationEventHandler()
}