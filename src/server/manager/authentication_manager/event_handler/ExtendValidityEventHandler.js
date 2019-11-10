var config = require('config')
var util = require('util')
var path = require('path')
const uuidv4 = require('uuid/v4')

const TOKEN = config.get('auth.token')
const REFRESH_TOKEN = config.get('auth.refreshToken')
const AUTH_ATTRIBUTES = config.get('auth.authAttributes')
const {
  TO,
  EVENTS,
  RESPONSE_EVENTS
} = require(path.join(config.get('src.property'), 'property'))
const RES_META = require(path.join(config.get('src.property'), 'messageStatus')).SOCKET
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
var EventHandler = require(path.join(config.get('src.manager'), 'EventHandler'))

const VALIDITY_EXTENDED_SUCCESS = RES_META.VALIDITY_EXTENDED_SUCCESS


util.inherits(ExtendValidityEventHandler, EventHandler)

function ExtendValidityEventHandler () {
  this.name = arguments.callee.name
}

ExtendValidityEventHandler.prototype.eventName = EVENTS.EXTEND_VALIDITY

ExtendValidityEventHandler.prototype.handle = async function (requestInfo) {
  if (!this.isValid(requestInfo)) {
    console.warn(`${this.eventName}: request info is invalid.`)
    return
  }

  var authService = this.globalContext.authService
  var storageService = this.globalContext.storageService

  var socket = requestInfo.socket
  var packet = requestInfo.packet

  if (authService.isAuthenticated(packet)) {
    console.log(`token is still valid`)
    this.alertException(`XXXXXX token is still valid XXXXXX`, requestInfo)
    socket.disconnect(true)
    return
  }

  // var secret = await storageService.getUserValidateInfo(packet.uid)
  // if (authService.isValidCert(packet, secret) === false) {
  //   console.log(`refresh token is invalid`)
  //   this.alertException(`XXXXXX refresh token is invalid XXXXXX`, requestInfo)
  //   socket.disconnect(true)
  //   return
  // }

  // var token = authService.obtainAuthorization(packet)
  // var newSecret = uuidv4()
  // var refreshToken = authService.obtainValidCert(packet, newSecret)
  // await storageService.saveUserValidateInfo(packet.uid, newSecret)

  // this.sendValidationToUser(token, refreshToken, requestInfo)

  // storageService.removeUserValidateInfo(packet.uid, secret)
}

ExtendValidityEventHandler.prototype.sendValidationToUser = function (token, refreshToken, requestInfo) {
  var businessEvent = this.globalContext.businessEvent
  var packet = requestInfo.packet

  var resInfo = new ResponseInfo()
    .assignProtocol(requestInfo)
    .setHeader({
      to: TO.USER,
      receiver: packet.uid,
      responseEvent: RESPONSE_EVENTS.REFRESHED_TOKEN
    })
    .responsePacket({
      [TOKEN]: token,
      [REFRESH_TOKEN]: refreshToken
    }, VALIDITY_EXTENDED_SUCCESS)

  businessEvent.emit(EVENTS.SEND_MESSAGE, resInfo)
}

ExtendValidityEventHandler.prototype.isValid = function (requestInfo) {
  var packet = requestInfo.packet
  if (packet == null) {
    return false
  }

  AUTH_ATTRIBUTES.forEach(prop => {
    if (packet[prop] === undefined) {
      return false
    }
  })

  return true
}

module.exports = {
  handler: new ExtendValidityEventHandler()
}
