var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const INVITATION_LIST_SUCCESS = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET.INVITATION_LIST_SUCCESS
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(GetInvitationListEventHandler, EventHandler)

function GetInvitationListEventHandler () {
  this.name = arguments.callee.name
}

GetInvitationListEventHandler.prototype.eventName = EVENTS.GET_INVITATION_LIST

GetInvitationListEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  Promise.resolve(this.getInvitationList(requestInfo))
    .then(invitationList => this.sendInvitationList(invitationList, requestInfo))
    .catch(err => this.alertException(err.message, requestInfo))
}

GetInvitationListEventHandler.prototype.getInvitationList = async function (requestInfo) {
  var storageService = this.globalContext['storageService']

  var packet = requestInfo.packet
  var uid = packet.uid
  var inviType = packet.inviType
  var limit = packet.inviLimit
  var skip = packet.inviSkip || 0

  var invitationList
  if (inviType.indexOf('received') === 0) {
    invitationList = await storageService.getReceivedInvitationList(uid, limit, skip)
  } else if (inviType.indexOf('sent') === 0) {
    invitationList = await storageService.getSentInvitationList(uid, limit, skip)
  }

  return invitationList
}

GetInvitationListEventHandler.prototype.sendInvitationList = function (invitationList, requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet

  if (invitationList.length !== 0) {
    invitationList.map(invitation => _.omit(invitation, ['sensitive']))
  }

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.INVITATION_LIST // non-realtime invitation list
    })
    .responsePacket(invitationList, INVITATION_LIST_SUCCESS)
    .responseMsg(`get '${packet.inviType}' invitation list. list size: ${invitationList.length}`)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

GetInvitationListEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null &&
    typeof requestInfo.packet.inviType === 'string' &&
    requestInfo.packet.inviLimit != null
}

module.exports = {
  handler: new GetInvitationListEventHandler()
}
