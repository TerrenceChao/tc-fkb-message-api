var config = require('config')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))

function EventHandler () { }

EventHandler.prototype.eventName = 'eventName is undefined'

EventHandler.prototype.handle = function (requestInfo) {
  throw new Error(`[EventHandler]: You should implement 'handle'.`)
}

EventHandler.prototype.alertException = function (msgCode, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.EXCEPTION_ALERT // back to user
    })
    .setPacket({
      msgCode
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

EventHandler.prototype.isAuthenticated = function (packet) {
  var authService = this.globalContext['authService']
  return authService.isAuthenticated(packet)
}

module.exports = EventHandler
