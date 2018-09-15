var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))
const RequestInfo = require(path.join(config.get('manager'), 'RequestInfo'))

util.inherits(LoginEventHandler, EventHandler)

function LoginEventHandler () {
  this.name = arguments.callee.name
}

LoginEventHandler.prototype.eventName = EVENTS.LOGIN

LoginEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new LoginEventHandler()
}
