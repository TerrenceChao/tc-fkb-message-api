var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

const {
  USER_INFO,
  SETTING_EVENT
} = config.get('app')
const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))

const NOTIFICATION_PUSHED_INFO = RES_META.NOTIFICATION_PUSHED_INFO

util.inherits(PushNotificationEventHandler, EventHandler)

function PushNotificationEventHandler () {
  this.name = arguments.callee.name
}

PushNotificationEventHandler.prototype.eventName = EVENTS.PUSH_NOTIFICATION

PushNotificationEventHandler.prototype.handle = function (requestInfo) {
  var res = requestInfo.res
  var next = requestInfo.next
  var packet = requestInfo.packet
  var notificationPacket = _.omit(packet, ['receivers'])

  Promise.resolve(requestInfo.packet.receivers)
    .then(receivers => Promise.all(
      receivers.map(
        receiver => this.action(requestInfo, receiver, notificationPacket)
      )
    ))
    .then(() => (res.locals.data.event = notificationPacket.event))
    .then(() => next())
    .catch(err => next(err || new Error('Error occurred during push notification')))
}

PushNotificationEventHandler.prototype.action = async function (reqInfo, receiver, notificationPacket) {
  if (this.isPersonalUpdate(receiver, notificationPacket)) {
    return this.updateUser(receiver, notificationPacket)
  }

  return this.emitNotification(reqInfo, receiver, notificationPacket)
}

PushNotificationEventHandler.prototype.isPersonalUpdate = function (receiver, notificationPacket) {
  if (notificationPacket.event === SETTING_EVENT.UPDATE_PUBLIC_INFO &&
    notificationPacket.content.uid === receiver.uid) {
    return true
  }

  return false
}

PushNotificationEventHandler.prototype.updateUser = async function (receiver, notificationPacket) {
  const info = _.pick(notificationPacket.content, USER_INFO)
  return Promise.resolve(this.globalContext.storageService.updateUserInfo(receiver.uid, info, ['uid']))
}

PushNotificationEventHandler.prototype.emitNotification = function (reqInfo, receiver, notificationPacket) {
  var responseInfo = new ResponseInfo()
    .assignProtocol(reqInfo)
    .setHeader({
      to: TO.USER,
      receiver: receiver.uid,
      responseEvent: RESPONSE_EVENTS.NOTIFICATION_PUSHED
    })
    .responsePacket(notificationPacket, NOTIFICATION_PUSHED_INFO)

  this.globalContext.businessEvent.emit(EVENTS.SEND_MESSAGE, responseInfo)
  return true
}

module.exports = {
  handler: new PushNotificationEventHandler()
}
