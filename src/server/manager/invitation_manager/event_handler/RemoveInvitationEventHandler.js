var config = require('config')
var util = require('util')
var path = require('path')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

const INVITATION_REMOVED_SUCCESS = RES_META.INVITATION_REMOVED_SUCCESS
var respondErr = RES_META.REMOVE_INVITATION_ERR


util.inherits(RemoveInvitationEventHandler, EventHandler)

function RemoveInvitationEventHandler () {
  this.name = arguments.callee.name
}

RemoveInvitationEventHandler.prototype.eventName = EVENTS.REMOVE_INVITATION

RemoveInvitationEventHandler.prototype.handle = function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var storageService = this.globalContext['storageService']
  var packet = requestInfo.packet
  var iid = packet.iid

  Promise.resolve(storageService.invitationRemoved(iid))
    .then(() => this.notify(requestInfo))
    .catch(err => this.alertException(respondErr(err), requestInfo))
}

RemoveInvitationEventHandler.prototype.notify = function (requestInfo) {
  var businessEvent = this.globalContext['businessEvent']
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.INVITATION_REMOVED
    })
    // .setPacket({
    //   msgCode: `Invitation is removed. iid: ${packet.iid}`,
    //   data: {
    //     uid: packet.uid,
    //     iid: packet.iid
    //   }
    // })
    .responsePacket({
      uid: packet.uid,
      iid: packet.iid
    }, INVITATION_REMOVED_SUCCESS)
    .responseMsg(`Invitation is removed. iid: ${packet.iid}`)
  
  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

RemoveInvitationEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  return packet !== undefined &&
    typeof packet.uid === 'string' &&
    typeof packet.iid === 'string'
}

module.exports = {
  handler: new RemoveInvitationEventHandler()
}
