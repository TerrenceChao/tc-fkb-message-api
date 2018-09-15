var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(ReleaseLockEventHandler, EventHandler)

function ReleaseLockEventHandler() {
  this.name = arguments.callee.name
}

ReleaseLockEventHandler.prototype.eventName = EVENTS.RELEASE_LOCK

ReleaseLockEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new ReleaseLockEventHandler()
}