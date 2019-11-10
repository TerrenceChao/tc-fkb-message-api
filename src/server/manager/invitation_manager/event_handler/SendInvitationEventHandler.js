var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

const HAS_INVITED_INFO = RES_META.HAS_INVITED_INFO
const INVITATION_RECEIVED_INFO = RES_META.INVITATION_RECEIVED_INFO
var respondDBErr = RES_META.CHANNEL_OR_INVITATION_DB_ERR
var respondSendErr = RES_META.SEND_INVITATION_ERR

util.inherits(SendInvitationEventHandler, EventHandler)

function SendInvitationEventHandler () {
  this.name = arguments.callee.name
}

SendInvitationEventHandler.prototype.eventName = EVENTS.SEND_INVITATION

SendInvitationEventHandler.prototype.handle = function (requestInfo) {
  // if (!this.isValid(requestInfo)) {
  //   console.warn(`${this.eventName}: request info is invalid.`)
  //   return
  // }

  var storageService = this.globalContext.storageService
  var packet = requestInfo.packet
  var chid = packet.chid

  Promise.resolve(storageService.getChannelInfo({ chid }))
    .then(channelInfo => this.createAndGetInvitations(channelInfo, requestInfo),
      err => this.alertException(respondDBErr(err), requestInfo))
    .then(invitationList => {
      invitationList.length === 0 ? this.noticeUser(requestInfo) : this.sendInvitations(invitationList, requestInfo)
    }, err => this.alertException(respondSendErr(err), requestInfo))
}

SendInvitationEventHandler.prototype.createAndGetInvitations = async function (channelInfo, requestInfo) {
  var storageService = this.globalContext.storageService
  var packet = requestInfo.packet
  var inviter = packet.inviter
  var newRecipients = packet.recipients
  var content = packet.content

  var membersOrRecipientsHasBeenInvited = channelInfo.members.concat(channelInfo.recipients)
  var recipients = _.pullAll(newRecipients, membersOrRecipientsHasBeenInvited)
  var inviData = this.getInvitationCreateionData(channelInfo)

  var invitationList = []
  if (recipients.length === 0) {
    return invitationList
  }

  invitationList = await storageService.invitationMultiCreated(
    inviter,
    recipients,
    inviData.header,
    content,
    inviData.sensitive
  )

  return invitationList
}

SendInvitationEventHandler.prototype.getInvitationCreateionData = function (channelInfo) {
  return {
    header: {
      requestEvent: EVENTS.DEAL_WITH_INVITATION,
      data: {
        channelName: channelInfo.name
      }
    },
    sensitive: {
      chid: channelInfo.chid
    }
  }
}

SendInvitationEventHandler.prototype.noticeUser = function (requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.inviter,
      responseEvent: RESPONSE_EVENTS.PERSONAL_INFO // inviter self
    })
    // .setPacket({
    //   msgCode: 'The recipients may have been invited or are members',
    //   data: {
    //     uid: packet.inviter
    //   }
    // })
    .responsePacket({ uid: packet.inviter }, HAS_INVITED_INFO)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

SendInvitationEventHandler.prototype.sendInvitations = function (invitationList, requestInfo) {
  var businessEvent = this.globalContext.businessEvent

  invitationList.forEach(invitation => {
    _.unset(invitation, 'sensitive')

    var resInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.USER,
        receiver: invitation.recipient,
        responseEvent: RESPONSE_EVENTS.INVITATION_CREATED // to individual recipients (realtime)
      })
      // .setPacket({
      //   msgCode: 'you got an invitation',
      //   data: invitation
      // })
      .responsePacket(invitation, INVITATION_RECEIVED_INFO)

    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
  })
}

// SendInvitationEventHandler.prototype.isValid = function (requestInfo) {
//   return (
//     requestInfo.packet != null &&
//     requestInfo.packet.inviter != null &&
//     Array.isArray(requestInfo.packet.recipients) &&
//     typeof requestInfo.packet.chid === 'string' &&
//     requestInfo.packet.content != null
//   )
// }

module.exports = {
  handler: new SendInvitationEventHandler()
}
