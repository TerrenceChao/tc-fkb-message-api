const EventEmitter = require('events').EventEmitter
var config = require('config')
var path = require('path')
const { authenticateService } = require(path.join(
  config.get('service'),
  'authenticateService'
))
const { storageService } = require(path.join(
  config.get('service'),
  'storageService'
))

module.exports = {
  businessEvent: new EventEmitter(),
  socketServer: undefined,
  authenticateService,
  storageService
}
