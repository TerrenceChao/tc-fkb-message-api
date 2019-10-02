var config = require('config')
var util = require('util')
var path = require('path')
var _ = require('lodash')

const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))

util.inherits(PushNotificationEventHandler, EventHandler)

function PushNotificationEventHandler () {
  this.name = arguments.callee.name
}

PushNotificationEventHandler.prototype.eventName = EVENTS.PUSH_NOTIFICATION

PushNotificationEventHandler.prototype.handle = function (requestInfo) {
  var businessEvent = this.globalContext['businessEvent']

  var res = requestInfo.res
  var next = requestInfo.next
  var packet = requestInfo.packet
  var notificationPacket = _.omit(packet, ['receivers'])

  Promise.resolve(requestInfo.packet.receivers)
    .then(receivers => Promise.all(
      receivers.map(receiver => {
        var resInfo = new ResponseInfo()
          .assignProtocol(requestInfo)
          .setHeader({
            to: TO.CHANNEL,
            receiver: receiver.uid,
            responseEvent: RESPONSE_EVENTS.NOTIFICATION_PUSHED
          })
          .setPacket({
            msgCode: `notification pushed`,
            data: notificationPacket
          })
        
        businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
        return true
      })
    ))
    .then(() => res.locals.data.event = notificationPacket.event)
    .then(() => next())
    .catch(err => next(err || new Error(`Error occurred during push notification`)))

}

module.exports = {
  handler: new PushNotificationEventHandler()
}
