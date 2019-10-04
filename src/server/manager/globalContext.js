const EventEmitter = require('events').EventEmitter
var config = require('config')
var path = require('path')
const {
  authService
} = require(path.join(config.get('src.service'), 'authService'))
const {
  storageService
} = require(path.join(config.get('src.service'), 'storageService'))
const {
  socketService
} = require(path.join(config.get('src.service'), 'socketService'))

module.exports = {
  businessEvent: new EventEmitter(),
  authService,
  socketServer: undefined,
  socketService,
  storageService,
}
