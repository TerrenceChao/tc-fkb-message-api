const EventEmitter = require('events').EventEmitter
var config = require('config')
var path = require('path')
const {
  authService
} = require(path.join(config.get('src.service'), 'authService'))
const {
  storageService
} = require(path.join(config.get('src.service'), 'storageServiceTemplate'))

module.exports = {
  businessEvent: new EventEmitter(),
  socketServer: undefined,
  authService,
  storageService
}
