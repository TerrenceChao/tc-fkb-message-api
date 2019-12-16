function RequestInfo () {
  this.req = null
  this.res = null
  this.next = null
  this.socket = null
  this.packet = null
}

RequestInfo.prototype.assignProtocol = function (requestInfo) {
  this.req = requestInfo.req
  this.res = requestInfo.res
  this.next = requestInfo.next
  this.socket = requestInfo.socket

  return this
}

RequestInfo.prototype.setPacket = function (packet) {
  this.packet = packet

  return this
}

module.exports = RequestInfo
