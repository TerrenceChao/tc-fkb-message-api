function EventHandler () {}

EventHandler.prototype.eventName = 'eventName is undefined'

EventHandler.prototype.handle = function (requestInfo) {
  throw new Error(`[EventHandler]: You should implement 'handle'.`)
}

EventHandler.prototype.isAuthenticated = function (packet) {
  var authService = this.globalContext['authService']
  return authService.isAuthenticated(packet)
}

module.exports = EventHandler
