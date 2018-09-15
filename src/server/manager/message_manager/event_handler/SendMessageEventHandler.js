var config = require('config')
var util = require('util')
var path = require('path')
const _ = require('lodash')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(SendMessageEventHandler, EventHandler)

function SendMessageEventHandler () {
  this.name = arguments.callee.name
}

SendMessageEventHandler.prototype.eventName = EVENTS.SEND_MESSAGE

SendMessageEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new SendMessageEventHandler()
}
