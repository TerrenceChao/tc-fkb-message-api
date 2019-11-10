var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))
util.inherits(ConnectEventHandler, EventHandler)

function ConnectEventHandler () {
  this.name = arguments.callee.name
}

ConnectEventHandler.prototype.eventName = EVENTS.CONNECT

ConnectEventHandler.prototype.handle = function (requestInfo) {
  // if (!this.isValid(requestInfo)) {
  //   console.warn(`${this.eventName}: request info is invalid.`)
  //   return
  // }

  var businessEvent = this.globalContext.businessEvent
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_ONLINE, requestInfo)
}

// ConnectEventHandler.prototype.isValid = function (requestInfo) {
//   return requestInfo.packet != null &&
//     requestInfo.packet.uid != null
// }

module.exports = {
  handler: new ConnectEventHandler()
}
