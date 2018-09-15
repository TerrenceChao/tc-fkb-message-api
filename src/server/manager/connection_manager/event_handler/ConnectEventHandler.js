var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(ConnectEventHandler, EventHandler)

function ConnectEventHandler () {
  this.name = arguments.callee.name
}

ConnectEventHandler.prototype.eventName = EVENTS.CONNECT

ConnectEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new ConnectEventHandler()
}
