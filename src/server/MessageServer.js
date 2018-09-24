var path = require('path')
var config = require('config')
var socketIo = require('socket.io')

let globalContext = require(path.join(config.get('manager'), 'globalContext'))
var ConnectionManager = require(path.join(config.get('connection.manager'), 'ConnectionManager'))
var AuthenticationManager = require(path.join(config.get('authentication.manager'), 'AuthenticationManager'))
var ChannelManager = require(path.join(config.get('channel.manager'), 'ChannelManager'))
var InvitationManager = require(path.join(config.get('invitation.manager'), 'InvitationManager'))
var UserManager = require(path.join(config.get('user.manager'), 'UserManager'))
var MessageManager = require(path.join(config.get('message.manager'), 'MessageManager'))

function startUp (httpServer) {
  var socketServer = socketIo.listen(httpServer)
  globalContext.socketServer = socketServer

  let connectionManager = new ConnectionManager().init(globalContext)
  let authenticationManager = new AuthenticationManager().init(globalContext)
  let channelManager = new ChannelManager().init(globalContext)
  let invitationManager = new InvitationManager().init(globalContext)
  let userManager = new UserManager().init(globalContext)
  let messageManager = new MessageManager().init(globalContext)

  socketServer.sockets.on('connection', function (socket) {
    var protocol = {
      socket
    }
    connectionManager.startListen(protocol)
    authenticationManager.startListen(protocol)
    channelManager.startListen(protocol)
    invitationManager.startListen(protocol)
    userManager.startListen(protocol)
    messageManager.startListen(protocol)
  })
}

module.exports = {
  startUp
}
