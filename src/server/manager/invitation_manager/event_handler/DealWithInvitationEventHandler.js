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

DealWithInvitationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var {
    uid,
    firstName,
    iid,
    dealWith
  } = packet

  var storageService = this.globalContext['storageService']
  var invitation = await storageService.getInvitation(iid)
  if (invitation == null) {
    this.alertException(`invitation id is invalid.`, requestInfo)
    return
  }

  if (dealWith === 'y') {
    var businessEvent = this.globalContext['businessEvent']
    businessEvent.emit(
      BUSINESS_EVENTS.JOIN_CHANNEL,
      requestInfo.setPacket({
        uid,
        firstName,
        chid: invitation.sensitive.chid
      }))
  } else {
    var reqEvent = RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL // notify in channel
    var msgCode = `${firstName} is canceled`
    this.notifyInChanel(reqEvent, msgCode, invitation, requestInfo)
  }
}

DealWithInvitationEventHandler.prototype.notifyInChanel = function (reqEvent, msgCode, invitation, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: invitation.sensitive.ciid,
      responseEvent: reqEvent
    })
    .setPacket({
      msgCode
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
