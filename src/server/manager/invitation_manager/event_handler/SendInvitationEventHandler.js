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

util.inherits(SendInvitationEventHandler, EventHandler)

function SendInvitationEventHandler () {
  this.name = arguments.callee.name
}

SendInvitationEventHandler.prototype.eventName = EVENTS.SEND_INVITATION

SendInvitationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var invitee = packet.invitee
  var chid = packet.chid

  var query = {
    chid
  }
  var storageService = this.globalContext['storageService']
  var channelInfo = await storageService.getChannelInfo(query)
  var sensitive = {
    ciid: channelInfo.ciid
  }
  packet.channelName = channelInfo.name

  var businessEvent = this.globalContext['businessEvent']
  Promise.resolve(this.pack(invitee, packet, sensitive))
    .then(resInfoList =>
      resInfoList.map(resInfo => {
        resInfo.assignProtocol(requestInfo)
        businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
      }))
}

SendInvitationEventHandler.prototype.pack = async function (invitee, packet, sensitive) {
  var {
    inviter,
    chid,
    channelName,
    content
  } = packet

  var headerForInvitee = {
    requestEvent: EVENTS.DEAL_WITH_INVITATION,
    data: {
      chid,
      channelName
    }
  }

  var invitations = await this.globalContext['storageService']
    .invitationCreated(inviter, invitee, headerForInvitee, content, sensitive)

  return invitations.map(invite => {
    _.unset(invite, 'sensitive')

    return new ResponseInfo()
      .setHeader({
        to: TO.USER,
        receiver: invite.invitee,
        responseEvent: RESPONSE_EVENTS.INVITATION_FROM_CHANNEL_TO_ME // to individual invitee
      })
      .setPacket({
        msgCode: 'you got an invitation',
        data: invite
      })
  })
}

SendInvitationEventHandler.prototype.isValid = function (requestInfo) {
  return (
    requestInfo.packet != null &&
    requestInfo.packet.inviter != null &&
    (typeof requestInfo.packet.invitee === 'string' || Array.isArray(requestInfo.packet.invitee)) &&
    typeof requestInfo.packet.chid === 'string' &&
    requestInfo.packet.content != null
  )
}

module.exports = {
  handler: new SendInvitationEventHandler()
}
