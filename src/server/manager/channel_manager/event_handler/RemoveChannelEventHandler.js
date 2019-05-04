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

util.inherits(RemoveChannelEventHandler, EventHandler)

function RemoveChannelEventHandler () {
  this.name = arguments.callee.name
}

RemoveChannelEventHandler.prototype.eventName = EVENTS.REMOVE_CHANNEL

RemoveChannelEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var chid = requestInfo.packet.chid
  var query = {
    chid
  }

  Promise.resolve(storageService.channelInfoRemoved(query))
    .then(confirm => this.notifyUser(requestInfo),
      err => this.alertException(err.message, requestInfo))
}

RemoveChannelEventHandler.prototype.notifyUser = function (requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var uid = packet.uid
  var chid = packet.chid

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_REMOVED
    })
    .setPacket({
      msgCode: `channel is removed`,
      data: {
        chid
      }
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

RemoveChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.chid != null
}

module.exports = {
  handler: new RemoveChannelEventHandler()
}
