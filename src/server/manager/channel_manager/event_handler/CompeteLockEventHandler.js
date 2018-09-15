var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(CompeteLockEventHandler, EventHandler)

function CompeteLockEventHandler () {
  this.name = arguments.callee.name
}

CompeteLockEventHandler.prototype.eventName = EVENTS.COMPETE_LOCK

CompeteLockEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new CompeteLockEventHandler()
}
