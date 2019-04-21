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
  var dealWith = packet.dealWith

  Promise.resolve(storageService.getInvitation(iid))
    .then(invitation => {
      if (dealWith === 'y') {
        this.triggerJoinChannelEvent(invitation, requestInfo)
      } else {
        this.notifyUserIsCanceledInChanel(invitation, requestInfo)
      }
    }, err => this.alertException(err.message, requestInfo))
}

DealWithInvitationEventHandler.prototype.triggerJoinChannelEvent = function (invitation, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var uid = packet.uid
  var firstName = packet.firstName

  businessEvent.emit(
    BUSINESS_EVENTS.JOIN_CHANNEL,
    requestInfo.setPacket({
      uid,
      firstName,
      chid: invitation.sensitive.chid
    }))
}

DealWithInvitationEventHandler.prototype.notifyUserIsCanceledInChanel = function (invitation, requestInfo) {
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
      msgCode: `${packet.firstName} is canceled`
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

DealWithInvitationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.firstName === 'string' &&
    typeof packet.iid === 'string' &&
    packet.dealWith != null
}

module.exports = {
  handler: new DealWithInvitationEventHandler()
}
