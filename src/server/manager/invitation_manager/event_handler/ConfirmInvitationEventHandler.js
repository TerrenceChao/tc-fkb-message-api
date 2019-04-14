var config = require('config')
var util = require('util')
var path = require('path')

const {
  EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

util.inherits(ConfirmInvitationEventHandler, EventHandler)

function ConfirmInvitationEventHandler () {
  this.name = arguments.callee.name
}

ConfirmInvitationEventHandler.prototype.eventName = EVENTS.CONFIRM_INVITATION

ConfirmInvitationEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var packet = requestInfo.packet
  var iid = packet.iid

  var storageService = this.globalContext['storageService']
  if (await storageService.invitationRemoved(iid) === false) {
    // must have 'uid' if 'alertException'
    this.alertException(`remove invitation: ${iid} fail`, requestInfo)
  }
}

ConfirmInvitationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.iid === 'string' &&
    this.isAuthenticated(packet)
}

module.exports = {
  handler: new ConfirmInvitationEventHandler()
}
