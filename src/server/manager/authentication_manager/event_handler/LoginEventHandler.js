var config = require('config')
var util = require('util')
var path = require('path')

const TOKEN = config.get('auth.token')
const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(LoginEventHandler, EventHandler)

function LoginEventHandler () {
  this.name = arguments.callee.name
}

LoginEventHandler.prototype.eventName = EVENTS.LOGIN

LoginEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  var authService = this.globalContext['authService']
  if (!await authService.authorized(packet)) {
    socket.disconnect(true)
    return
  }

  // Notify: user is online
  var businessEvent = this.globalContext['businessEvent']
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)

  // get user's channel list
  var uid = packet.uid
  var chanLimit = packet.chanLimit
  var storageService = this.globalContext['storageService']
  var userChannelInfo = await storageService.getUserChannelInfoList(uid, chanLimit)

  this.sendChannelInfoAndConversations(requestInfo, userChannelInfo)
  this.sendReceivedInvitations(requestInfo)
}

LoginEventHandler.prototype.sendChannelInfoAndConversations = function (requestInfo, userChannelInfo) {
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  var packet = requestInfo.packet
  var uid = packet.uid
  var convLimit = packet.convLimit

  userChannelInfo.forEach(async (chInfo) => {
    chInfo.conversations = await storageService.getConversationList(chInfo.ciid, convLimit)

    var resInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.USER,
        receiver: uid,
        responseEvent: RESPONSE_EVENTS.CHANNEL_LIST
      })
      .setPacket({
        msgCode: `channel: ${chInfo.name} and conversations`,
        data: chInfo
      })

    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
  })
}

LoginEventHandler.prototype.sendReceivedInvitations = function (requestInfo) {
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  var packet = requestInfo.packet
  var uid = packet.uid
  var inviLimit = packet.inviLimit

  Promise
    .resolve(storageService.getReceivedInvitationList(uid, inviLimit))
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

LoginEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.sessionId === 'string' &&
    typeof packet[TOKEN] === 'string' &&
    typeof packet.uid === 'string' &&
    packet.inviLimit != null &&
    packet.chanLimit != null &&
    packet.convLimit != null &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new LoginEventHandler()
}
