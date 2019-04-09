var path = require('path')

module.exports = function (root) {
  var src = path.join(root, 'src')
  var server = path.join(src, 'server')
  var manager = path.join(server, 'manager')

  return {
    property: path.join(src, 'property'),
    repository: path.join(src, 'repository'),
    router: path.join(src, 'router'),
    service: path.join(src, 'service'),
    server: server,
    manager: manager,

    connectionManager: path.join(manager, 'connection_manager'),
    authenticationManager: path.join(manager, 'authentication_manager'),
    channelManager: path.join(manager, 'channel_manager'),
    invitationManager: path.join(manager, 'invitation_manager'),
    userManager: path.join(manager, 'user_manager'),
    messageManager: path.join(manager, 'message_manager'),

    connectionEventHandler: path.join(manager, 'connection_manager', 'event_handler'),
    authenticationEventHandler: path.join(manager, 'authentication_manager', 'event_handler'),
    channelEventHandler: path.join(manager, 'channel_manager', 'event_handler'),
    invitationEventHandler: path.join(manager, 'invitation_manager', 'event_handler'),
    userEventHandler: path.join(manager, 'user_manager', 'event_handler'),
    messageEventHandler: path.join(manager, 'message_manager', 'event_handler')
  }
}
