var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(ServerPushEventHandler, EventHandler)

function ServerPushEventHandler () {
  this.name = arguments.callee.name
}

ServerPushEventHandler.prototype.eventName = EVENTS.SERVER_PUSH

ServerPushEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new ServerPushEventHandler()
}
