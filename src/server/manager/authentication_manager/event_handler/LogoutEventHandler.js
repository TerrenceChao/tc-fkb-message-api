var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(LogoutEventHandler, EventHandler)

function LogoutEventHandler () {
  this.name = arguments.callee.name
}

LogoutEventHandler.prototype.eventName = EVENTS.LOGOUT

LogoutEventHandler.prototype.handle = async function (requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  businessEvent.emit(EVENTS.CHANNEL_OFFLINE, requestInfo)
  businessEvent.emit(EVENTS.USER_OFFLINE, requestInfo)

  /**
   * 待優化：
   * 在 login 期間 user 所瀏覽過 (點開看過) 的 channel(s), 需要將該 channel(s) 最後一次被 user
   * 瞥見訊息的時間，更新/紀錄在 table "UserInChannel" (從聊天室 A 切換到其他頁面的那個時間點,
   * 將離開聊天室 A 的 "時間" 紀錄下來，當作聊天室 A 的 last glimpse time) 。
   * user login 期間將所有房間的 last glimpse time(s) 暫時紀錄於 client 端，logout 時將這些
   * 各個房間的 lastGlimpse(s) 更新回 database。
   * 當下次 user login 時，需要透過每個 channel 最後一則 conversation 的 datetime 順序 (desc)
   * 來載入前幾個 channelInfo(s), 此時和 lastGlimpse 比較，就會知道哪些屬於未讀訊息了
   */
  var storageService = this.globalContext.storageService
  var packet = requestInfo.packet
  var uid = packet.uid
  var config = packet.config

  try {
    /**
     * TODO: [updateLastGlimpse] not working:
     * msg: [Cannot-read-property-'map'-of-undefined]
     */
    await storageService.updateLastGlimpse(uid, config.glimpses)
  } catch (err) {
    console.error(err.message)
  }
}

module.exports = {
  handler: new LogoutEventHandler()
}
