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

ConfirmInvitationEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var packet = requestInfo.packet
  var iid = packet.iid

  Promise.resolve(storageService.invitationRemoved(iid))
    .catch(err => this.alertException(err.message, requestInfo))
}

ConfirmInvitationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.iid === 'string'
}

module.exports = {
  handler: new ConfirmInvitationEventHandler()
}
