var config = require('config')
var path = require('path')

const {
  PROTOCOL
} = require(path.join(config.get('property'), 'property'))

function ResponseInfo () {
  this.req = null
  this.res = null
  this.socket = null

  this.header = null
  this.packet = null
}

ResponseInfo.prototype.assignProtocol = function (requestInfo) {
  this.req = requestInfo.req
  this.res = requestInfo.res
  this.socket = requestInfo.socket

  return this
}

ResponseInfo.prototype.setHeader = function (header) {
  if (this.header === null) {
    this.header = {}
  }

  var {
    protocol,
    sender,
    to,
    receiver,
    responseEvent
  } = header

  this.header.protocol = protocol || this.header.protocol || PROTOCOL.SOCKET
  this.header.sender = sender || this.header.sender
  this.header.to = to || this.header.to
  this.header.receiver = receiver || this.header.receiver
  this.header.responseEvent = responseEvent || this.header.responseEvent

  return this
}

ResponseInfo.prototype.setPacket = function (packet) {
  this.packet = packet

  return this
}

module.exports = ResponseInfo
