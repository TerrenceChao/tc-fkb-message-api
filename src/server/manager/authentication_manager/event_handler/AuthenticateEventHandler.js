var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(AuthenticateEventHandler, EventHandler)

function AuthenticateEventHandler () {
  this.name = arguments.callee.name
}

AuthenticateEventHandler.prototype.eventName = EVENTS.AUTHENTICATE

AuthenticateEventHandler.prototype.handle = function (requestInfo) {
  console.log(`Authenticate EventHandler: ${JSON.stringify(requestInfo.packet)}`)
}

module.exports = {
  handler: new AuthenticateEventHandler()
}
