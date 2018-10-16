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

util.inherits(RemoveChannelEventHandler, EventHandler)

function RemoveChannelEventHandler () {
  this.name = arguments.callee.name
}

RemoveChannelEventHandler.prototype.eventName = EVENTS.REMOVE_CHANNEL

RemoveChannelEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var chid = packet.chid
  var channelName = packet.channelName

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_REMOVED
    })

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']
  var query = {
    chid
  }

  if (await storageService.channelInfoRemoved(query) === true) {
    resInfo.setPacket({
      msgCode: `channel: ${channelName} is removed`,
      data: true
    })
  } else {
    resInfo.setHeader({
      responseEvent: RESPONSE_EVENTS.EXCEPTION_ALERT
    }).setPacket({
      msgCode: `channel: ${channelName} is failed to remove`,
      data: false
    })
  }

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

RemoveChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined && this.isAuthenticated(packet) &&
    typeof packet.uid === 'string' &&
    packet.chid != null
}

module.exports = {
  handler: new RemoveChannelEventHandler()
}
