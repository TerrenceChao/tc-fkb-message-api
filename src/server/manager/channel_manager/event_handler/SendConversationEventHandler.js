var config = require('config')
var util = require('util')
var path = require('path')

const {
  REQUEST_EVENTS,
  BUSINESS_EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(SendConversationEventHandler, EventHandler)

function SendConversationEventHandler () {
  this.name = arguments.callee.name
}

SendConversationEventHandler.prototype.eventName = REQUEST_EVENTS.SEND_CONVERSATION

SendConversationEventHandler.prototype.handle = async function (requestInfo) {

}

module.exports = {
  handler: new SendConversationEventHandler()
}
