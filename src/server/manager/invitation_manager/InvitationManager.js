var config = require('config')
var util = require('util')
var path = require('path')

const Manager = require(path.join(config.get('src.manager'), 'Manager'))

util.inherits(InvitationManager, Manager)

function InvitationManager () {
  this.name = arguments.callee.name
  this.rootDir = __dirname
}

module.exports = InvitationManager
