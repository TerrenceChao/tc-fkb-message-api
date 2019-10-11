var config = require('config')
var path = require('path')
var _ = require('lodash')
const { PROTOCOL, EVENTS } = require(path.join(config.get('src.property'), 'property'))
const customMetaMsg = require(path.join(config.get('src.property'), 'messageStatus')).customMetaMsg

function ResponseInfo () {
  this.req = null
  this.res = null
  this.next = null
  this.socket = null

  this.header = null
  this.packet = null
}

ResponseInfo.prototype.assignProtocol = function (requestInfo) {
  this.req = requestInfo.req
  this.res = requestInfo.res
  this.next = requestInfo.next
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
  this.header.responseEvent = responseEvent || this.header.responseEvent || EVENTS.EXCEPTION_ALERT

  return this
}

ResponseInfo.prototype.setPacket = function (packet) {
  this.packet = packet

  return this
}

ResponseInfo.prototype.responsePacket = function (data, meta) {
  this.packet = {
    data,
    meta
  }

  return this
}

ResponseInfo.prototype.responseMsg = function (resMsg = []) {
  if (_.get(this.packet, 'meta.msg') !== undefined) {
    this.packet.meta.msg = Array.isArray(resMsg) ? customMetaMsg(this.packet.meta, resMsg) : resMsg
  }
    
  return this
}


module.exports = ResponseInfo
