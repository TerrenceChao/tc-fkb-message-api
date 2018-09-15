var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(CreateChannelEventHandler, EventHandler)

function CreateChannelEventHandler () {
  this.name = arguments.callee.name
}

CreateChannelEventHandler.prototype.eventName = EVENTS.CREATE_CHANNEL

CreateChannelEventHandler.prototype.handle = async function (requestInfo) {

}

module.exports = {
  handler: new CreateChannelEventHandler()
}
