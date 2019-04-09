var fs = require('fs')
var path = require('path')
var package = JSON.parse(fs.readFileSync(__dirname + '/../package.json'))
const ROOT = getParentDirPath(__dirname, package.name)

/**
 * @private
 * @param {string} currentDir
 * @param {string} specifyDir
 * @returns {string}
 */
function getParentDirPath(currentDir, specifyDir) {
  if (specifyDir == null) {
    return path.resolve(currentDir, '../')
  }

  while (path.basename(currentDir) != specifyDir) {
    currentDir = path.resolve(currentDir, '../')
  }
  return currentDir
}

/**
 * src path
 */
var src = path.join(ROOT, 'src')
var property = path.join(src, 'property')
var repository = path.join(src, 'repository')
var router = path.join(src, 'router')
var server = path.join(src, 'server')
var service = path.join(src, 'service')

var manager = path.join(server, 'manager')
var connection_manager = path.join(manager, 'connection_manager')
var authentication_manager = path.join(manager, 'authentication_manager')
var channel_manager = path.join(manager, 'channel_manager')
var invitation_manager = path.join(manager, 'invitation_manager')
var user_manager = path.join(manager, 'user_manager')
var message_manager = path.join(manager, 'message_manager')

var connection_event_handler = path.join(manager, 'connection_manager', 'event_handler')
var authentication_event_handler = path.join(manager, 'authentication_manager', 'event_handler')
var channel_event_handler = path.join(manager, 'channel_manager', 'event_handler')
var invitation_event_handler = path.join(manager, 'invitation_manager', 'event_handler')
var user_event_handler = path.join(manager, 'user_manager', 'event_handler')
var message_event_handler = path.join(manager, 'message_manager', 'event_handler')

/**
 * test path
 */
var feature_test = path.join(ROOT, 'test', 'feature')
var unit_test = path.join(ROOT, 'test', 'unit')

var router_test = path.join(feature_test, 'router')
var message_server_test = path.join(feature_test, 'server')
var seed = path.join(feature_test, 'seed')

var property_test = path.join(unit_test, 'property')
var repository_test = path.join(unit_test, 'repository')
var service_test = path.join(unit_test, 'service')

var manager_test = path.join(unit_test, 'server', 'manager')
var connection_manager_test = path.join(manager_test, 'connection_manager')
var authentication_manager_test = path.join(manager_test, 'authentication_manager')
var channel_manager_test = path.join(manager_test, 'channel_manager')
var invitation_manager_test = path.join(manager_test, 'invitation_manager')
var user_manager_test = path.join(manager_test, 'user_manager')
var message_manager_test = path.join(manager_test, 'message_manager')

var connection_event_handler_test = path.join(manager_test, 'connection_manager', 'event_handler')
var authentication_event_handler_test = path.join(manager_test, 'authentication_manager', 'event_handler')
var channel_event_handler_test = path.join(manager_test, 'channel_manager', 'event_handler')
var invitation_event_handler_test = path.join(manager_test, 'invitation_manager', 'event_handler')
var user_event_handler_test = path.join(manager_test, 'user_manager', 'event_handler')
var message_event_handler_test = path.join(manager_test, 'message_manager', 'event_handler')

require('dotenv').config({
  path: path.join(ROOT, '.env')
})

module.exports = {

  app: require('./_app'),
  auth: require('./_auth'),
  adaptor: require('./_adaptor'),

  // src
  property,
  repository,

  router,
  server,
  manager,
  connection: {
    manager: connection_manager,
    event_handler: connection_event_handler
  },
  authentication: {
    manager: authentication_manager,
    event_handler: authentication_event_handler
  },
  channel: {
    manager: channel_manager,
    event_handler: channel_event_handler
  },
  invitation: {
    manager: invitation_manager,
    event_handler: invitation_event_handler
  },
  user: {
    manager: user_manager,
    event_handler: user_event_handler
  },
  message: {
    manager: message_manager,
    event_handler: message_event_handler
  },

  service,

  // feature test
  router_test,
  message_server_test,
  seed,

  // unit test
  property_test,
  repository_test,

  connection_test: {
    manager: connection_manager_test,
    event_handler: connection_event_handler_test
  },
  authentication_test: {
    manager: authentication_manager_test,
    event_handler: authentication_event_handler_test
  },
  channel_test: {
    manager: channel_manager_test,
    event_handler: channel_event_handler_test
  },
  invitation_test: {
    manager: invitation_manager_test,
    event_handler: invitation_event_handler_test
  },
  user_test: {
    manager: user_manager_test,
    event_handler: user_event_handler_test
  },
  message_test: {
    manager: message_manager_test,
    event_handler: message_event_handler_test
  },

  service_test
}