var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))
const RequestInfo = require(path.join(config.get('manager'), 'RequestInfo'))

util.inherits(LogoutEventHandler, EventHandler)

function LogoutEventHandler () {
  this.name = arguments.callee.name
}

LogoutEventHandler.prototype.eventName = EVENTS.LOGOUT

LogoutEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new LogoutEventHandler()
}
