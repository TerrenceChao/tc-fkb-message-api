var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(LogoutEventHandler, EventHandler)

function LogoutEventHandler () {
  this.name = arguments.callee.name
}

LogoutEventHandler.prototype.eventName = EVENTS.LOGOUT

LogoutEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var businessEvent = this.globalContext['businessEvent']
  businessEvent.emit(EVENTS.USER_OFFLINE, requestInfo)
}

LogoutEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string'
}

module.exports = {
  handler: new LogoutEventHandler()
}
