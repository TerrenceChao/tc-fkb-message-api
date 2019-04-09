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

util.inherits(JoinChannelEventHandler, EventHandler)

function JoinChannelEventHandler () {
  this.name = arguments.callee.name
}

JoinChannelEventHandler.prototype.eventName = EVENTS.JOIN_CHANNEL

JoinChannelEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var socket = requestInfo.socket
  var uid = packet.uid
  var iid = packet.iid
  var chid = packet.chid
  var ciid = packet.ciid

  var socketServer = this.globalContext['socketServer']
  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  if (await storageService.channelJoined(uid, chid)) {
    socketServer.of('/').adapter.remoteJoin(socket.id, ciid)

    var resInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.CHANNEL,
        receiver: ciid,
        responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL
      })
      .setPacket({
        msgCode: `${uid} is joined`,
        data: {
          uid,
          ciid,
          datetime: Date.now()
        } // add uid to channel.members(array) for "each member" in localStorage (frontend)
      })
    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

    requestInfo.packet.removingIid = iid
    businessEvent.emit(EVENTS.DEAL_WITH_INVITATION, requestInfo)
  }
}

JoinChannelEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    packet.iid != null &&
    packet.chid != null &&
    packet.ciid != null &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new JoinChannelEventHandler()
}
