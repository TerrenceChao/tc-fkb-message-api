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

  try {
    var user = await storageService.getUser(packet.uid)
    if (user == null) {
      await storageService.createUser(packet.uid)
    }
  } catch (err) {
    this.alertException(err.message, requestInfo)
  }

  // Initial: user makes connections to self & channel
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_ONLINE, requestInfo)

  packet.inviType = 'received'
  businessEvent.emit(EVENTS.GET_INVITATION_LIST, requestInfo)

  // get user's channel list & belonged conversations
  Promise.resolve(storageService.getUserChannelInfoList(packet.uid, packet.chanLimit))
    .then(userChannelInfoList => this.sendChannelInfoAndConversations(userChannelInfoList, requestInfo))
    .catch(err => this.alertException(err.message, requestInfo))
}

LoginEventHandler.prototype.sendChannelInfoAndConversations = function (userChannelInfoList, requestInfo) {
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  var packet = requestInfo.packet
  var uid = packet.uid
  var convLimit = packet.convLimit

  userChannelInfoList.forEach(async (chInfo) => {
    var ciid = chInfo.ciid

    Promise.resolve(storageService.getConversationList(ciid, convLimit))
      .then(conversationList => {
        chInfo.conversations = conversationList

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
      .catch(err => this.alertException(err.message, requestInfo))
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
