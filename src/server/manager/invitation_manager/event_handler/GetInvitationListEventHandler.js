var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('property'), 'property'))
const ResponseInfo = require(path.join(config.get('manager'), 'ResponseInfo'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(GetInvitationListEventHandler, EventHandler)

function GetInvitationListEventHandler () {
  this.name = arguments.callee.name
}

GetInvitationListEventHandler.prototype.eventName = EVENTS.GET_INVITATION_LIST

GetInvitationListEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}:`, `request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var uid = packet.uid
  var limit = packet.limit
  var skip = packet.skip

  var storageService = this.globalContext['storageService']
  var invitationList = await storageService.getInvitationList(uid, limit, skip)
}

GetInvitationListEventHandler.prototype.isValid = function (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null &&
    requestInfo.packet.limit != null
}

module.exports = {
  handler: new GetInvitationListEventHandler()
}
