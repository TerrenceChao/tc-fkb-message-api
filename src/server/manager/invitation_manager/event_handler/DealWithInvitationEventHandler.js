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

util.inherits(DealWithInvitationEventHandler, EventHandler)

function DealWithInvitationEventHandler () {
  this.name = arguments.callee.name
}

DealWithInvitationEventHandler.prototype.eventName = EVENTS.DEAL_WITH_INVITATION

DealWithInvitationEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var packet = requestInfo.packet
  var iid = packet.iid
  var dealWith = packet.dealWith.toLowerCase()

  Promise.resolve(storageService.getInvitation(iid))
    .then(invitation => {
      if (dealWith === 'y') {
        this.triggerJoinChannelEvent(invitation, requestInfo)
      } else {
        this.broadcastUserHasCanceled(invitation, requestInfo)
        this.confirmToCancelInvitation(invitation, requestInfo)
      }
    }, err => this.alertException(err.message, requestInfo))
}

DealWithInvitationEventHandler.prototype.triggerJoinChannelEvent = function (invitation, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var uid = packet.uid
  var nickname = packet.nickname

  businessEvent.emit(
    BUSINESS_EVENTS.JOIN_CHANNEL,
    requestInfo.setPacket({
      uid,
      nickname,
      chid: invitation.sensitive.chid
    }))
}

DealWithInvitationEventHandler.prototype.broadcastUserHasCanceled = function (invitation, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: invitation.sensitive.ciid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL // notify in channel
    })
    .setPacket({
      msgCode: `${packet.nickname} is canceled`
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

DealWithInvitationEventHandler.prototype.confirmToCancelInvitation = function (invitation, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.PERSONAL_INFO
    })
    .setPacket({
      msgCode: `I'am canceled to join channel`,
      data: {
        uid: packet.uid,
        iid: packet.iid
      }
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
  businessEvent.emit(EVENTS.CONFIRM_INVITATION, requestInfo)
}

DealWithInvitationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.nickname === 'string' &&
    typeof packet.iid === 'string' &&
    typeof packet.dealWith === 'string'
}

module.exports = {
  handler: new DealWithInvitationEventHandler()
}
