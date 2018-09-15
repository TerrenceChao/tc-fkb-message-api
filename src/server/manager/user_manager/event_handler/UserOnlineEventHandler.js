var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(UserOnlineEventHandler, EventHandler)

function UserOnlineEventHandler () {
  this.name = arguments.callee.name
}

UserOnlineEventHandler.prototype.eventName = EVENTS.USER_ONLINE

UserOnlineEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new UserOnlineEventHandler()
}
