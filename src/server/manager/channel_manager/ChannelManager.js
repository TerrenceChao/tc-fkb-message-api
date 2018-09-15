var config = require('config')
var util = require('util')
var path = require('path')

const Manager = require(path.join(config.get('manager'), 'Manager'))

util.inherits(ChannelManager, Manager)

function ChannelManager () {
  this.name = arguments.callee.name
  this.rootDir = __dirname
}

module.exports = ChannelManager
