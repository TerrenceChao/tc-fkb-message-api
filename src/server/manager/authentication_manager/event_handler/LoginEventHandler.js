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

  var authService = this.globalContext['authService']
  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  if (!await authService.authorized(packet)) {
    socket.disconnect(true)
    return
  }

  // Initial: user makes connections to self & channel
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_ONLINE, requestInfo)

  // get user's channel list
  Promise.resolve(storageService.getUserChannelInfoList(packet.uid, packet.chanLimit))
    .then(channelInfoList => this.sendChannelInfoAndConversations(requestInfo, channelInfoList))
    .catch(() => this.alertException(`get user's channel list FAIL`, requestInfo))

  this.sendReceivedInvitations(requestInfo)
}

LoginEventHandler.prototype.sendChannelInfoAndConversations = function (requestInfo, userChannelInfoList) {
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  var packet = requestInfo.packet
  var uid = packet.uid
  var convLimit = packet.convLimit

  userChannelInfoList.forEach(async (chInfo) => {
    var ciid = chInfo.ciid
    // avoid send sensitive info to client ("ciid" is sensitive)
    delete chInfo.ciid

    Promise.resolve(storageService.getConversationList(ciid, convLimit))
      .then(conversations => {
        chInfo.conversations = conversations

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
      .catch(() => this.alertException(`get conversations of channel: ${ciid} FAIL`, requestInfo))
  })
}

LoginEventHandler.prototype.sendReceivedInvitations = function (requestInfo) {
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  var packet = requestInfo.packet
  var uid = packet.uid
  var inviLimit = packet.inviLimit

  Promise.resolve(storageService.getReceivedInvitationList(uid, inviLimit))
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
    .catch(() => {
      this.alertException(`get invitation(s) FAIL`, requestInfo)
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
    packet.convLimit != null
}

module.exports = {
  handler: new LoginEventHandler()
}
