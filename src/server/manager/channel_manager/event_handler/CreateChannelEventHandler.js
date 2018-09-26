var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('property'), 'property'))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(CreateChannelEventHandler, EventHandler)

function CreateChannelEventHandler() {
  this.name = arguments.callee.name
}

CreateChannelEventHandler.prototype.eventName = EVENTS.CREATE_CHANNEL

CreateChannelEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var channelName = packet.channelName

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.CHANNEL_CREATED
    })

  var storageService = this.globalContext['storageService']
  var businessEvent = this.globalContext['businessEvent']

  // 'return null' if channelInfo had has been created.
  var channelInfo = await storageService.channelInfoCreated(uid, channelName)
  if (channelInfo == null) {
    resInfo.setHeader({
      responseEvent: RESPONSE_EVENTS.EXCEPTION_ALERT
    }).setPacket({
      msgCode: `channel: ${channelName} is failed to create or has been created`,
      data: false
    })
  } else {
    delete channelInfo.ciid

    resInfo.setPacket({
      msgCode: `channel: ${channelName} is created`,
      data: channelInfo
    })
  }

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