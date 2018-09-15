var config = require('config')
var util = require('util')
var path = require('path')

const {
  REQUEST_EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))
const RequestInfo = require(path.join(config.get('manager'), 'RequestInfo'))

util.inherits(GetChannelListEventHandler, EventHandler)

function GetChannelListEventHandler () {
  this.name = arguments.callee.name
}

GetChannelListEventHandler.prototype.eventName = REQUEST_EVENTS.GET_CHANNEL_LIST

GetChannelListEventHandler.prototype.handle = async function (requestInfo) {

}

module.exports = {
  handler: new GetChannelListEventHandler()
}
