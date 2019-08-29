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
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var iid = packet.iid
  var dealWith = packet.dealWith.toLowerCase()

  Promise.resolve(storageService.getInvitation(iid))
    .then(invitation => {
      if (dealWith === 'y') {
        this.joinChannel(invitation, requestInfo)
      } else {
        this.broadcastRecipientCanceled(invitation, requestInfo)
      }
      return true
    })
    // [BUG] 當 dealWith === 'y', 執行 joinChannel, 無法刪除 invitation.
    // dealWith !== 'y' 卻可以成功刪除！
    .then(() => businessEvent.emit(EVENTS.REMOVE_INVITATION, requestInfo),
      err => this.alertException(err.message, requestInfo))
}

DealWithInvitationEventHandler.prototype.joinChannel = function (invitation, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet
  var targetUid = packet.targetUid
  var nickname = packet.nickname

  businessEvent.emit(
    BUSINESS_EVENTS.JOIN_CHANNEL,
    requestInfo.setPacket({
      targetUid,
      nickname,
      chid: invitation.sensitive.chid
    }))
}

DealWithInvitationEventHandler.prototype.broadcastRecipientCanceled = function (invitation, requestInfo) {
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
      msgCode: `${packet.nickname} is canceled`,
      data: {
        uid: packet.targetUid
      }
    })
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

DealWithInvitationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.targetUid === 'string' &&
    typeof packet.nickname === 'string' &&
    typeof packet.iid === 'string' &&
    typeof packet.dealWith === 'string'
}

module.exports = {
  handler: new DealWithInvitationEventHandler()
}
