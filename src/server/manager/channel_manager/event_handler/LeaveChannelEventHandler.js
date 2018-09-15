var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(LeaveChannelEventHandler, EventHandler)

function LeaveChannelEventHandler () {
  this.name = arguments.callee.name
}

LeaveChannelEventHandler.prototype.eventName = EVENTS.LEAVE_CHANNEL

LeaveChannelEventHandler.prototype.handle = async function (requestInfo) {

}

module.exports = {
  handler: new LeaveChannelEventHandler()
}
