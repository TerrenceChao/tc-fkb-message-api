var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))
util.inherits(ConnectEventHandler, EventHandler)

function ConnectEventHandler () {
  this.name = arguments.callee.name
}

ConnectEventHandler.prototype.eventName = EVENTS.CONNECT

ConnectEventHandler.prototype.handle = function (requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_ONLINE, requestInfo)
}

module.exports = {
  handler: new ConnectEventHandler()
}
