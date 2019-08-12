var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(JoinChannelEventHandler, EventHandler)

function JoinChannelEventHandler () {
  this.name = arguments.callee.name
}

JoinChannelEventHandler.prototype.eventName = EVENTS.JOIN_CHANNEL

JoinChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var packet = requestInfo.packet
  var uid = packet.uid
  var chid = packet.chid

  /**
   * 待優化？
   * 拿到 chid 後，先將自己的 uid 廣播給 channel 內成員，讓他們拿到需要更新的 memebers (多一個 uid)，
   * 再來執行 channelJoined, then getChannelInfo, 最後 user 才會拿到整個 channelInfo ???
   *
   * 結論：
   * 沒有必要。在未加入 channel 前，除了 chid 以外，其他關於 channelInfo 的 name, ciid, members ... etc
   * 都拿不到，沒有辦法傳送/接收訊息，僅僅讓其他成員搶先一步知道有新的成員即將加入沒有太大意義。
   */

  // channelJoined: refresh channelInfo FIRST
  Promise.resolve(storageService.channelJoined(uid, chid))
    .then(refreshedChannelInfo => this.executeJoin(refreshedChannelInfo, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

JoinChannelEventHandler.prototype.executeJoin = function (channelInfo, requestInfo) {
  var socketServer = this.globalContext['socketServer']
  socketServer.of('/').adapter.remoteJoin(requestInfo.socket.id, channelInfo.ciid)

  this.broadcastInviteeJoined(channelInfo, requestInfo)
  this.sendChannelInfoToUser(channelInfo, requestInfo)
}

JoinChannelEventHandler.prototype.broadcastInviteeJoined = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var uid = packet.uid
  var nickname = packet.nickname

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: channelInfo.ciid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL // notify in channel
    })
    .setPacket({
      msgCode: `${nickname} has joined`,
      data: {
        uid,
        // 1. refresh members: add uid to channel.members(array), remove uid from channel.invitees(array) for "each member" in localStorage (frontend)
        // 2. 其他使用者登入時，只載入了少數的 channelInfo, 有可能沒載入此 channelInfo 的資訊。當新的成員加入時可提供更新後的 channelInfo 給前端
        channelInfo,
        datetime: Date.now()
      }
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

JoinChannelEventHandler.prototype.sendChannelInfoToUser = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var uid = requestInfo.packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_JOINED // to user self
    })
    .setPacket({
      msgCode: `get refreshed channelinfo. including name, chid, ciid, creator, members`,
      data: channelInfo
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

JoinChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.nickname === 'string' &&
    typeof packet.chid === 'string'
}

module.exports = {
  handler: new JoinChannelEventHandler()
}
