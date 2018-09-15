var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('property'), 'property'))
const EventHandler = require(path.join(config.get('manager'), 'EventHandler'))

util.inherits(GetInvitationListEventHandler, EventHandler)

function GetInvitationListEventHandler () {

}

GetInvitationListEventHandler.prototype.eventName = EVENTS.GET_INVITATION_LIST

GetInvitationListEventHandler.prototype.handle = function (requestInfo) {

}

module.exports = {
  handler: new GetInvitationListEventHandler()
}
