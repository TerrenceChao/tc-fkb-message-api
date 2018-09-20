var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('property'), 'property'))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(DealWithInvitationEventHandler, EventHandler)

function DealWithInvitationEventHandler () {
  this.name = arguments.callee.name
}

DealWithInvitationEventHandler.prototype.eventName = EVENTS.DEAL_WITH_INVITATION

DealWithInvitationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var {
    uid,
    chid,
    dealwith,
    iid
  } = packet

  var businessEvent = this.globalContext['businessEvent']
  var storageService = this.globalContext['storageService']
  var msgCode = `You have canceled to join channel ${chid}`

  if (dealwith === 'y') {
    msgCode = `You have joined into channel ${chid}`
    /**
     * 如果你這次沒加入到房間(exe fail)  這次邀請就沒用了！！！要再邀請一次！！
     * 如果你這次沒加入到房間(exe fail)  這次邀請就沒用了！！！要再邀請一次！！
     * 如果你這次沒加入到房間(exe fail)  這次邀請就沒用了！！！要再邀請一次！！
     */
    var invitation = await storageService.getInvitationThenRemoved(iid)
    requestInfo.packet = {
      uid,
      ciid: invitation.sensitive.ciid
    }
    businessEvent.emit(BUSINESS_EVENTS.JOIN_CHANNEL, requestInfo)
  }

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: uid,
      responseEvent: RESPONSE_EVENTS.INVITATION_FROM_CHANNEL_TO_ME // push again
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
    typeof packet.chid === 'string' &&
    packet.dealwith != null
}

module.exports = {
  handler: new DealWithInvitationEventHandler()
}
