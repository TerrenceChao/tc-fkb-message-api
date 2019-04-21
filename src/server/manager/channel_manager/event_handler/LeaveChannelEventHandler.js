var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(LeaveChannelEventHandler, EventHandler)

function LeaveChannelEventHandler () {
  this.name = arguments.callee.name
}

LeaveChannelEventHandler.prototype.eventName = EVENTS.LEAVE_CHANNEL

LeaveChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  var packet = requestInfo.packet
  var uid = packet.uid
  var chid = packet.chid
  var chInfoQuery = {
    chid
  }

  // 待優化：client 可以傳送自己版本的 channelInfo(所有資訊), 藉此先更新其他人的 channelInfo, 
  // 等待 DB 確實更新 channelInfo 紀錄, 收到 response 後再刪除 client 端的 channelInfo。
  // [NOTE] 那如果沒接收到 DB 更新成功的訊息？
  // [NOTE] 是否要跟 join 成對的用同樣的 pattern? 交互的 join/leave 會有更新不即時的情況？

  // channelLeaved: refresh channelInfo FIRST
  Promise.resolve(storageService.channelLeaved(uid, chid))
    .then(confirm => storageService.getChannelInfo(chInfoQuery),
      err => this.alertException(err.message, requestInfo))
    .then(refreshedChannelInfo => this.executeLeave(refreshedChannelInfo, requestInfo),
      err => this.alertException(err.message, requestInfo))
    .then(refreshedChannelInfo => {
      // remove entire channel & belonged conversations if there's no member
      if (refreshedChannelInfo.members.length === 0) {
        businessEvent.emit(BUSINESS_EVENTS.REMOVE_CHANNEL, requestInfo)
      }
    })
}

LeaveChannelEventHandler.prototype.executeLeave = function (channelInfo, requestInfo) {
  this.broadcastUserHasLeft(channelInfo, requestInfo)
  this.notifyUserToDelete(channelInfo, requestInfo)

  var socketServer = this.globalContext['socketServer']
  socketServer.of('/').adapter.remoteLeave(requestInfo.socket.id, channelInfo.ciid)

  return channelInfo
}

LeaveChannelEventHandler.prototype.broadcastUserHasLeft = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var uid = requestInfo.packet.uid
  var nickname = requestInfo.packet.nickname

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: channelInfo.ciid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `${nickname} has left`,
      data: {
        uid,
        // 1. delete uid from channel.members(array) for "each member" in localStorage (frontend)
        // 2. 其他使用者登入時，只載入了少數的 channelInfo, 有可能沒載入此 channelInfo 的資訊。當有成員離開時可提供更新後的 channelInfo 給前端
        channelInfo,
        datetime: Date.now()
      }
    })
  
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

LeaveChannelEventHandler.prototype.notifyUserToDelete = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var uid = requestInfo.packet.uid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_LEFT // to user self
    })
    .setPacket({
      msgCode: `delete channelinfo (${channelInfo.chid})`,
      data: {
        chid: channelInfo.chid
      }
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

LeaveChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.nickname === 'string' &&
    typeof packet.chid === 'string'
}

module.exports = {
  handler: new LeaveChannelEventHandler()
}
