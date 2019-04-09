'use esversion: 6'

var path = require('path')

module.exports = function (root) {
  var src = path.join(root, 'src')
  var server = path.join(src, 'server')

  var manager = path.join(server, 'manager')
  var connectionManager = path.join(manager, 'connection_manager')
  var authenticationManager = path.join(manager, 'authentication_manager')
  var channelManager = path.join(manager, 'channel_manager')
  var invitationManager = path.join(manager, 'invitation_manager')
  var userManager = path.join(manager, 'user_manager')
  var messageManager = path.join(manager, 'message_manager')

  var connectionEventHandler = path.join(manager, 'connection_manager', 'event_handler')
  var authenticationEventHandler = path.join(manager, 'authentication_manager', 'event_handler')
  var channelEventHandler = path.join(manager, 'channel_manager', 'event_handler')
  var invitationEventHandler = path.join(manager, 'invitation_manager', 'event_handler')
  var userEventHandler = path.join(manager, 'user_manager', 'event_handler')
  var messageEventHandler = path.join(manager, 'message_manager', 'event_handler')

  return {
    property: path.join(src, 'property'),
    repository: path.join(src, 'repository'),
    router: path.join(src, 'router'),
    service: path.join(src, 'service'),
    server
  }
}