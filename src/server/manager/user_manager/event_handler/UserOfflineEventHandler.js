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

util.inherits(UserOfflineEventHandler, EventHandler)

function UserOfflineEventHandler () {
  this.name = arguments.callee.name
}

UserOfflineEventHandler.prototype.eventName = EVENTS.USER_OFFLINE

UserOfflineEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}`, `request info is invalid`)
    return
  }

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var uid = packet.uid

  var storageService = this.globalContext['storageService']
  var channelIds = await storageService.getChannelInfoIds(uid)

  var businessEvent = this.globalContext['businessEvent']

  var resInfo = new ResponseInfo().assignProtocol(requestInfo)
  this.pack(resInfo, requestInfo)

  resInfo.setHeader({
    to: TO.USER,
    receiver: uid,
    responseEvent: RESPONSE_EVENTS.USER_LOGOUT
  })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

  resInfo.setHeader({
    to: TO.CHANNEL,
    receiver: channelIds,
    responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
  })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

  channelIds.forEach(ciid => {
    socket.leave(ciid)
  })

  socket.leave(uid)
}

UserOfflineEventHandler.prototype.pack = function (responseInfo, requestInfo) {
  var uid = requestInfo.packet.uid
  responseInfo.packet = {
    msgCode: `user: ${uid} is offline`
  }
}

UserOfflineEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}

module.exports = {
  handler: new UserOfflineEventHandler()
}
