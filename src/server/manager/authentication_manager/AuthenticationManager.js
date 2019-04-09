var config = require('config')
var util = require('util')
var path = require('path')

const Manager = require(path.join(config.get('src.manager'), 'Manager'))

util.inherits(AuthenticationManager, Manager)

function AuthenticationManager () {
  this.name = arguments.callee.name
  this.rootDir = __dirname
}

module.exports = AuthenticationManager
