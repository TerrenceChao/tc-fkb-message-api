var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(
  config.get('src.property'),
  'property'
))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

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

  Promise.resolve(this.getInvitationList(requestInfo))
    .then(invitationList => this.sendInvitationList(invitationList, requestInfo))
    .catch(err => this.alertException(err, requestInfo))
}

GetInvitationListEventHandler.prototype.getInvitationList = async function (requestInfo) {
  var storageService = this.globalContext['storageService']

  var packet = requestInfo.packet
  var uid = packet.uid
  var inviType = packet.inviType
  var limit = packet.inviLimit
  var skip = packet.inviSkip || 0

  var invitationList
  if (inviType === 'received') {
    invitationList = await storageService.getReceivedInvitationList(uid, limit, skip)
  } else if (inviType === 'sent') {
    invitationList = await storageService.getSentInvitationList(uid, limit, skip)
  }

  return invitationList
}

GetInvitationListEventHandler.prototype.sendInvitationList = function (invitationList, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.INVITATION_LIST_FROM_CHANNEL
    })
    .setPacket({
      msgCode: `get ${packet.inviType} invitation list`,
      data: invitationList
    })

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetInvitationListEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null &&
    requestInfo.packet.inviType != null &&
    requestInfo.packet.inviLimit != null
}

module.exports = {
  handler: new GetInvitationListEventHandler()
}
