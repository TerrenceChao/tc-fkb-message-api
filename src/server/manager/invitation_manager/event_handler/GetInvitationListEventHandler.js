var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(
  config.get('property'),
  'property'
))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(GetInvitationListEventHandler, EventHandler)

function GetInvitationListEventHandler () {
  this.name = arguments.callee.name
}

GetInvitationListEventHandler.prototype.eventName = EVENTS.GET_INVITATION_LIST

GetInvitationListEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var inviteType = packet.inviteType
  var limit = packet.limit
  var skip = packet.skip || 0

  var storageService = this.globalContext['storageService']
  var invitationList = []
  if (inviteType === 'received') {
    invitationList = await storageService.getReceivedInvitationList(
      uid,
      limit,
      skip
    )
  } else if (inviteType === 'sent') {
    invitationList = await storageService.getSentInvitationList(
      uid,
      limit,
      skip
    )
  }

  var businessEvent = this.globalContext['businessEvent']
  var resInfo = new ResponseInfo().assignProtocol(requestInfo).setHeader({
    to: TO.USER,
    receiver: uid,
    responseEvent: RESPONSE_EVENTS.INVITATION_LIST_FROM_CHANNEL
  })
  this.pack(resInfo, invitationList, inviteType)
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetInvitationListEventHandler.prototype.pack = function (
  responseInfo,
  packet,
  inviteType
) {
  responseInfo.packet = {
    msgCode: `get ${inviteType} invitation list`,
    data: packet
  }
}

GetInvitationListEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null &&
    requestInfo.packet.inviteType != null &&
    requestInfo.packet.limit != null &&
    this.isAuthenticated(requestInfo.packet)
}

module.exports = {
  handler: new GetInvitationListEventHandler()
}
