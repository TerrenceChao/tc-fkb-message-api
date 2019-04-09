var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

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
    iid,
    channelName,
    dealwith,
    removingIid
  } = packet

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']

  // callback from BUSINESS_EVENTS.JOIN_CHANNEL
  if (iid === removingIid) {
    storageService.invitationRemoved(removingIid)
    return
  }

  var msgCode
  var reqEvent

  if (dealwith === 'y') {
    var invitation = await storageService.getInvitation(iid)

    if (invitation == null) {
      msgCode = `invitation id is invalid.`
      reqEvent = RESPONSE_EVENTS.EXCEPTION_ALERT
    } else {
      msgCode = `You have joined into channel ${channelName}`
      reqEvent = RESPONSE_EVENTS.INVITATION_FROM_CHANNEL_TO_ME // push again

      businessEvent.emit(
        BUSINESS_EVENTS.JOIN_CHANNEL,
        requestInfo.setPacket({
          uid,
          iid,
          chid: invitation.sensitive.chid,
          ciid: invitation.sensitive.ciid,
          dealwith
        }))
    }
  } else {
    msgCode = `You have canceled to join channel ${channelName}`
    reqEvent = RESPONSE_EVENTS.INVITATION_FROM_CHANNEL_TO_ME // push again
    storageService.invitationRemoved(iid)
  }

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
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
    packet.iid != null &&
    typeof packet.uid === 'string' &&
    packet.dealwith != null &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new DealWithInvitationEventHandler()
}
