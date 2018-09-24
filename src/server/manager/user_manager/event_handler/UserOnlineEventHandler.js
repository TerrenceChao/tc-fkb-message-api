var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('property'), 'property'))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(UserOnlineEventHandler, EventHandler)

function UserOnlineEventHandler () {
  this.name = arguments.callee.name
}

UserOnlineEventHandler.prototype.eventName = EVENTS.USER_ONLINE

UserOnlineEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  socket.join(uid)

  var storageService = this.globalContext['storageService']
  var channelIds = await storageService.getChannelIds(uid)
  channelIds.forEach(ciid => {
    socket.join(ciid)
  })

  var businessEvent = this.globalContext['businessEvent']
  var resInfo = new ResponseInfo().assignProtocol(requestInfo)
  this.pack(resInfo, requestInfo)

  resInfo.setHeader({
    to: TO.USER,
    receiver: uid,
    responseEvent: RESPONSE_EVENTS.USER_LOGIN
  })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

  resInfo.setHeader({
    to: TO.CHANNEL,
    receiver: channelIds,
    responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
  })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

UserOnlineEventHandler.prototype.pack = function (responseInfo, requestInfo) {
  var uid = requestInfo.packet.uid
  responseInfo.packet = {
    msgCode: `user: ${uid} is online`
  }
}

UserOnlineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new UserOnlineEventHandler()
}
