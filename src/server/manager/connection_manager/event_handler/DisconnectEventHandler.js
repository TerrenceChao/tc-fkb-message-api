var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))
util.inherits(DisconnectEventHandler, EventHandler)

function DisconnectEventHandler () {
  this.name = arguments.callee.name
}

DisconnectEventHandler.prototype.eventName = EVENTS.DISCONNECT

DisconnectEventHandler.prototype.handle = function (requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  businessEvent.emit(EVENTS.USER_OFFLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_OFFLINE, requestInfo)
}

module.exports = {
  handler: new DisconnectEventHandler()
}
