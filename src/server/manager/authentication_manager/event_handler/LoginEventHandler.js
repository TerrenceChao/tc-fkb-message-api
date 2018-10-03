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

util.inherits(LoginEventHandler, EventHandler)

function LoginEventHandler() {
  this.name = arguments.callee.name
}

LoginEventHandler.prototype.eventName = EVENTS.LOGIN

LoginEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var authService = this.globalContext['authService']
  if (!await authService.authorized(packet)) {
    socket.disconnect(true)
    return
  }

  var businessEvent = this.globalContext['businessEvent']
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)

  var uid = packet.uid
  var storageService = this.globalContext['storageService']
  var userChannelInfo = await storageService.getUserChannelInfo(uid)

  Promise
    .all(userChannelInfo.map(chInfo => {
      return storageService.getConversationList(chInfo.ciid)
    }))
    .then(channelConversations => {
      var packet = this.pack(userChannelInfo, channelConversations)

      var resInfo = new ResponseInfo()
        .assignProtocol(requestInfo)
        .setHeader({
          to: TO.USER,
          receiver: uid,
          responseEvent: RESPONSE_EVENTS.CHANNEL_LIST
        })
        .setPacket({
          msgCode: `channel list and conversations`,
          data: packet
        })
      businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
    })

  var limit = packet.limit
  var skip = packet.skip
  Promise
    .resolve(storageService.getReceivedInvitationList(uid, limit, skip))
    .then(invitationList => {
      var resInfo = new ResponseInfo()
        .assignProtocol(requestInfo)
        .setHeader({
          to: TO.USER,
          receiver: uid,
          responseEvent: RESPONSE_EVENTS.INVITATION_LIST_FROM_CHANNEL
        })
        .setPacket({
          msgCode: `invitation list`,
          data: invitationList
        })
      businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
    })
}

LoginEventHandler.prototype.pack = function (userChannelInfo, conversations) {
  for (var i = 0; i < userChannelInfo.length; i++) {
    userChannelInfo[i].conversations = conversations[i]
  }
  return userChannelInfo
}

LoginEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.sessionId === 'string' &&
    typeof packet.msgToken === 'string' &&
    typeof packet.uid === 'string' &&
    packet.limit != null &&
    packet.skip != null
}

module.exports = {
  handler: new LoginEventHandler()
}