var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

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
        receiver => this.emitNotification(
          requestInfo,
          receiver,
          notificationPacket
        )
      )
    ))
    .then(() => res.locals.data.event = notificationPacket.event)
    .then(() => next())
    .catch(err => next(err || new Error(`Error occurred during push notification`)))

}

PushNotificationEventHandler.prototype.emitNotification = function (reqInfo, receiver, notificationPacket) {
  var responseInfo = new ResponseInfo()
    .assignProtocol(reqInfo)
    .setHeader({
      to: TO.USER,
      receiver: receiver.uid,
      responseEvent: RESPONSE_EVENTS.NOTIFICATION_PUSHED
    })
    // .setPacket({
    //   msgCode: `notification pushed`,
    //   data: notificationPacket
    // })
    .responsePacket(notificationPacket, NOTIFICATION_PUSHED_INFO)
  
  this.globalContext['businessEvent'].emit(EVENTS.SEND_MESSAGE, responseInfo)
  return true
}

module.exports = {
  handler: new PushNotificationEventHandler()
}
