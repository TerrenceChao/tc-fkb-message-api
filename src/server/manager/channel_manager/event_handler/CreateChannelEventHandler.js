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

util.inherits(CreateChannelEventHandler, EventHandler)

function CreateChannelEventHandler () {
  this.name = arguments.callee.name
}

CreateChannelEventHandler.prototype.eventName = EVENTS.CREATE_CHANNEL

CreateChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var uid = requestInfo.packet.uid
  var channelName = requestInfo.packet.channelName

  /**
   * 待優化？
   * client 可以自定義 ciid, chid 先建立 channel, 事後再透過 DB 建立紀錄
   * [NOTE] 那如果沒接收到 DB 建立成功的訊息？
   *
   * 結論：
   * create channel 時，此時尚未有其他成員，不會對訊息交換有效能上的拖累。
   * 穩定的將 channel 建立好即可。
   */

  Promise.resolve(storageService.channelInfoCreated(uid, channelName))
    .then(newChannelInfo => this.enterChannel(newChannelInfo, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

CreateChannelEventHandler.prototype.enterChannel = function (channelInfo, requestInfo) {
  var socketService = this.globalContext['socketService']
  // var socket = requestInfo.socket
  // socketServer.of('/').adapter.remoteJoin(socket.id, channelInfo.ciid)
  // socketService.join(socket.id, channelInfo.ciid)

  socketService.joinChannelSync(
    () => this.sendChannelInfoToUser(channelInfo, requestInfo),
    requestInfo.packet.uid,
    channelInfo.ciid
  )
}

CreateChannelEventHandler.prototype.sendChannelInfoToUser = function (channelInfo, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo).setHeader({
      to: TO.USER,
      receiver: channelInfo.creator,
      responseEvent: RESPONSE_EVENTS.CHANNEL_CREATED
    }).setPacket({
      msgCode: `channel: ${channelInfo.name} is created`,
      data: channelInfo
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

CreateChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.channelName === 'string'
}

module.exports = {
  handler: new CreateChannelEventHandler()
}
