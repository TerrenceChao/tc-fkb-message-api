function RequestInfo () {
  this.req = null
  this.res = null
  this.socket = null
  this.packet = null
}

RequestInfo.prototype.setPacket = function (packet) {
  this.packet = packet

  return this
}

module.exports = RequestInfo
