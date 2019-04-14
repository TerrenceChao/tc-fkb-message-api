var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(SendInvitationEventHandler, EventHandler)

function SendInvitationEventHandler () {
  this.name = arguments.callee.name
}

SendInvitationEventHandler.prototype.eventName = EVENTS.SEND_INVITATION

SendInvitationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']

  var packet = requestInfo.packet
  var inviter = packet.inviter
  var newInvitees = packet.invitees
  var chid = packet.chid
  var content = packet.content

  var channelInfo = await storageService.getChannelInfo({
    chid
  })
  if (channelInfo == null) {
    requestInfo.packet.uid = inviter
    this.alertException(`couldn't get channel info with chid: ${chid}`, requestInfo)
    return
  }

  var inviteesHasBeenInvited = channelInfo.invitees
  var invitees = _.pullAll(newInvitees, inviteesHasBeenInvited)
  var inviData = this.getInvitationCreateionData(channelInfo)

  var invitations = await storageService.invitationMultiCreated(
    inviter,
    invitees,
    inviData.header,
    content,
    inviData.sensitive
  )

  this.sendInvitations(invitations, requestInfo)
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
      chid: channelInfo.chid,
      ciid: channelInfo.ciid
    }
  }
}

SendInvitationEventHandler.prototype.sendInvitations = function (invitations, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']

  if (invitations == null) {
    requestInfo.packet.uid = requestInfo.packet.inviter
    this.alertException(`create invitation(s) fail`, requestInfo)
    return
  }

  invitations.forEach(invitation => {
    _.unset(invitation, 'sensitive')

    var resInfo = new ResponseInfo()
      .assignProtocol(requestInfo)
      .setHeader({
        to: TO.USER,
        receiver: invitation.invitee,
        responseEvent: RESPONSE_EVENTS.INVITATION_FROM_CHANNEL_TO_ME // to individual invitees
      })
      .setPacket({
        msgCode: 'you got an invitation',
        data: invitation
      })
    businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
  })
}

SendInvitationEventHandler.prototype.isValid = function (requestInfo) {
  return (
    requestInfo.packet != null &&
    requestInfo.packet.inviter != null &&
    Array.isArray(requestInfo.packet.invitees) &&
    typeof requestInfo.packet.chid === 'string' &&
    requestInfo.packet.content != null
  )
}

module.exports = {
  handler: new SendInvitationEventHandler()
}
