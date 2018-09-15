var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(RemoveChannelEventHandler, EventHandler)

function RemoveChannelEventHandler () {
  this.name = arguments.callee.name
}

RemoveChannelEventHandler.prototype.eventName = EVENTS.REMOVE_CHANNEL

RemoveChannelEventHandler.prototype.handle = async function (requestInfo) {

}

module.exports = {
  handler: new RemoveChannelEventHandler()
}
