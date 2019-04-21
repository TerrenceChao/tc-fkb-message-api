var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(LogoutEventHandler, EventHandler)

function LogoutEventHandler () {
  this.name = arguments.callee.name
}

LogoutEventHandler.prototype.eventName = EVENTS.LOGOUT

LogoutEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var businessEvent = this.globalContext['businessEvent']
  businessEvent.emit(EVENTS.USER_OFFLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_OFFLINE, requestInfo)

  // 待優化：在 UserInChannel(db table) 可能需要更新 user 所擁有的 channelInfo(s) 中, 
  // 其每個 channel 最新 conversation 的 datetime. 
  // user login 時需要載入的前幾個 channelInfo(s), 是由每個 channel 
  // 最後一則 conversation 的 datetime 的順序 (desc) 來排序的。
}

LogoutEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string'
}

module.exports = {
  handler: new LogoutEventHandler()
}
