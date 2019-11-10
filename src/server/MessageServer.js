var path = require('path')
var config = require('config')

const globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var ConnectionManager = require(path.join(config.get('src.connectionManager'), 'ConnectionManager'))
var AuthenticationManager = require(path.join(config.get('src.authenticationManager'), 'AuthenticationManager'))
var ChannelManager = require(path.join(config.get('src.channelManager'), 'ChannelManager'))
var ConversationManager = require(path.join(config.get('src.conversationManager'), 'ConversationManager'))
var InvitationManager = require(path.join(config.get('src.invitationManager'), 'InvitationManager'))
var UserManager = require(path.join(config.get('src.userManager'), 'UserManager'))
var MessageManager = require(path.join(config.get('src.messageManager'), 'MessageManager'))

function startUp (httpServer) {
  const connectionManager = new ConnectionManager().init(globalContext)
  const authenticationManager = new AuthenticationManager().init(globalContext)
  const channelManager = new ChannelManager().init(globalContext)
  const conversationManager = new ConversationManager().init(globalContext)
  const invitationManager = new InvitationManager().init(globalContext)
  const userManager = new UserManager().init(globalContext)
  const messageManager = new MessageManager().init(globalContext)

  globalContext.socketService.init(httpServer)
    .listen(function (socket) {
      var protocol = {
        socket
      }
      connectionManager.startListen(protocol)
      authenticationManager.startListen(protocol)
      channelManager.startListen(protocol)
      conversationManager.startListen(protocol)
      invitationManager.startListen(protocol)
      userManager.startListen(protocol)
      messageManager.startListen(protocol)
    })
}

module.exports = {
  startUp
}
