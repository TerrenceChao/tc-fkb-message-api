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
    .then(() => res.status(200).json({
      msgCode: `100000`,
      msg: `notification pushed as event: ${notificationPacket.event}`
    }))
    .catch(err => res.status(500).json({
      msgCode: `999999`,
      error: typeof err === 'string' ? err : `Error: An unknown error occurred during the push notification`
    }))
  
}

module.exports = {
  handler: new PushNotificationEventHandler()
}
