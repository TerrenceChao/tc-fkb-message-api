var path = require('path')

module.exports = function (root) {
  var feature = path.join(root, 'test', 'feature')
  var unit = path.join(root, 'test', 'unit')
  var managerInUnit = path.join(unit, 'server', 'manager')

  return {
    feature: {
      router: path.join(feature, 'router'),
      server: path.join(feature, 'server')
    },
    unit: {
      property: path.join(unit, 'property'),
      repository: path.join(unit, 'repository'),
      service: path.join(unit, 'service'),
      server: path.join(unit, 'server'),
      manager: managerInUnit,

      connectionManager: path.join(managerInUnit, 'connection_manager'),
      authenticationManager: path.join(managerInUnit, 'authentication_manager'),
      channelManager: path.join(managerInUnit, 'channel_manager'),
      invitationManager: path.join(managerInUnit, 'invitation_manager'),
      userManager: path.join(managerInUnit, 'user_manager'),
      messageManager: path.join(managerInUnit, 'message_manager'),

      connectionEventHandler: path.join(managerInUnit, 'connectionanager', 'event_handler'),
      authenticationEventHandler: path.join(managerInUnit, 'authentication_manager', 'event_handler'),
      channelEventHandler: path.join(managerInUnit, 'channelanager', 'event_handler'),
      invitationEventHandler: path.join(managerInUnit, 'invitation_manager', 'event_handler'),
      userEventHandler: path.join(managerInUnit, 'useranager', 'event_handler'),
      messageEventHandler: path.join(managerInUnit, 'message_manager', 'event_handler')
    }
  }
}
