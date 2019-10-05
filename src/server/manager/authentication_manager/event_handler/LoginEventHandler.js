var config = require('config')
var util = require('util')
var path = require('path')

const TOKEN = config.get('auth.token')
const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

const CONV_LIMIT = 1
const CHANNEL_LIST_INFO = RES_META.CHANNEL_LIST_INFO
const GET_CHANNEL_AND_CONVERSATION_LIST_SUCCESS = RES_META.GET_CHANNEL_AND_CONVERSATION_LIST_SUCCESS
var respondErr = RES_META.GET_CHANNEL_AND_CONVERSATION_LIST_ERR


util.inherits(LoginEventHandler, EventHandler)

function LoginEventHandler () {
  this.name = arguments.callee.name
}

LoginEventHandler.prototype.eventName = EVENTS.LOGIN

LoginEventHandler.prototype.handle = async function (requestInfo) {
  // if (!this.isValid(requestInfo)) {
  //   console.warn(`${this.eventName}: request info is invalid.`)
  //   return
  // }

  var authService = this.globalContext['authService']
  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  var socket = requestInfo.socket
  var packet = requestInfo.packet
  if (!await authService.authorized(packet)) {
    socket.disconnect(true)
    return
  }

  // // NOT waiting DB response here!!
  // storageService.findOrCreateUser(packet.uid)

  // Initial: user makes connections to self & channel
  businessEvent.emit(EVENTS.USER_ONLINE, requestInfo)
  businessEvent.emit(EVENTS.CHANNEL_ONLINE, requestInfo)

  packet.inviType = 'received'
  businessEvent.emit(EVENTS.GET_INVITATION_LIST, requestInfo)

  // get user's channel list & belonged conversations
  Promise.resolve(storageService.getUserChannelInfoList(packet.uid, packet.chanLimit))
    .then(userChannelInfoList => this.sendChannelInfoAndConversations(userChannelInfoList, requestInfo))
    .catch(err => this.alertException(respondErr(err), requestInfo))
}

LoginEventHandler.prototype.sendChannelInfoAndConversations = function (userChannelInfoList, requestInfo) {
  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  var packet = requestInfo.packet
  var uid = packet.uid
  var convLimit = packet.convLimit || CONV_LIMIT

  if (userChannelInfoList.length === 0) {
    var resInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.USER,
        receiver: uid,
        responseEvent: RESPONSE_EVENTS.CHANNEL_LIST
      })
      .responsePacket([], CHANNEL_LIST_INFO)

    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
    return
  }

  return Promise.all(userChannelInfoList.map(async chInfo => {
      chInfo.conversations = await storageService.getConversationList(uid, chInfo.chid, convLimit)
      return chInfo
    }))
    .then(chInfoList => {
      var resInfo = new ResponseInfo()
        .assignProtocol(requestInfo)
        .setHeader({
          to: TO.USER,
          receiver: uid,
          responseEvent: RESPONSE_EVENTS.CHANNEL_LIST
        })
        .responsePacket(chInfoList, GET_CHANNEL_AND_CONVERSATION_LIST_SUCCESS)

      businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
    })
}

// LoginEventHandler.prototype.isValid = function (requestInfo) {
//   var packet = requestInfo.packet
//   return packet !== undefined &&
//     typeof packet.sessionId === 'string' &&
//     typeof packet[TOKEN] === 'string' &&
//     typeof packet.uid === 'string' &&
//     packet.inviLimit != null &&
//     packet.chanLimit != null
// }

module.exports = {
  handler: new LoginEventHandler()
}
