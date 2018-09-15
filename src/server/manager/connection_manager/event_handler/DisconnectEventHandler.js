var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS,
  BUSINESS_EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(DisconnectEventHandler, EventHandler)

function DisconnectEventHandler () {
  this.name = arguments.callee.name
}

DisconnectEventHandler.prototype.eventName = EVENTS.DISCONNECT

DisconnectEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new DisconnectEventHandler()
}
