var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const { CONFIRM_INVITE, CANCEL_INVITE } = config.get('app')
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

const INVITATION_CANCELED_INFO = RES_META.INVITATION_CANCELED_INFO
var respondErr = RES_META.REPLY_INVITATION_ERR

util.inherits(DealWithInvitationEventHandler, EventHandler)

function DealWithInvitationEventHandler () {
  this.name = arguments.callee.name
}

DealWithInvitationEventHandler.prototype.eventName = EVENTS.DEAL_WITH_INVITATION

DealWithInvitationEventHandler.prototype.handle = function (requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  var storageService = this.globalContext.storageService
  var packet = requestInfo.packet
  var iid = packet.iid
  var dealWith = packet.dealWith.toLowerCase()

  const self = this
  const makingDecision = {
    [CONFIRM_INVITE]: self.joinChannel,
    [CANCEL_INVITE]: self.broadcastRecipientCanceled
  }

  Promise.resolve(storageService.getInvitation(iid))
    .then(invitation => makingDecision[dealWith](this, invitation, requestInfo))
    .then((newReqInfo) => businessEvent.emit(EVENTS.REMOVE_INVITATION, newReqInfo))
    .catch(err => this.alertException(respondErr(err), requestInfo))
}

/**
 * [BUG-FIXED]:
 * 之前只有[取消邀請]時 (broadcastRecipientCanceled) 才能[真的刪除邀請紀錄],
 * 而選擇[確認邀請]時 (joinChannel) 後續[無法刪除邀請紀錄]。
 *
 * 因為[原本的requestInfo.packet]為了加入房間，已經被改為不是能正確刪除邀請紀錄的內容了，
 * 所以這裡用新的reqInfo [new-RequestInfo()...]解決。
 */
DealWithInvitationEventHandler.prototype.joinChannel = function (self, invitation, requestInfo) {
  var businessEvent = self.globalContext.businessEvent
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

  return new RequestInfo()
    .assignProtocol(requestInfo)
    .setPacket({
      uid: targetUid,
      iid: packet.iid
    })
}

DealWithInvitationEventHandler.prototype.broadcastRecipientCanceled = function (self, invitation, requestInfo) {
  var businessEvent = self.globalContext.businessEvent
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.CHANNEL,
      receiver: invitation.sensitive.chid,
      responseEvent: RESPONSE_EVENTS.CONVERSATION_FROM_CHANNEL // notify in channel
    })
    .responsePacket({ uid: packet.targetUid }, INVITATION_CANCELED_INFO)
    .responseMsg(`${packet.nickname} is canceled`)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)

  return requestInfo
}

module.exports = {
  handler: new DealWithInvitationEventHandler()
}
