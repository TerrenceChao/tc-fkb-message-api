var config = require('config')
var util = require('util')
var path = require('path')

const {
  BUSINESS_EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(UserOfflineEventHandler, EventHandler)

function UserOfflineEventHandler () {
  this.name = arguments.callee.name
}

UserOfflineEventHandler.prototype.eventName = BUSINESS_EVENTS.USER_OFFLINE

UserOfflineEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new UserOfflineEventHandler()
}
