var socketIo = require('socket.io')
var {
  adaptor
} = require('../server/Adapter')

function SocketService() { 
  this.socketServer = {}
}

SocketService.prototype.init = function (httpServer) {
  this.socketServer = socketIo.listen(httpServer)
  adaptor(this.socketServer)
  
  return this
}

// make socket connections
SocketService.prototype.listen = function (callback) {
  this.socketServer.sockets.on('connection', function (socket) {
    callback(socket)
  })
}

// // join (need improve)
// SocketService.prototype.join = function (socketId, channelId, namespace = '/') {
//   this.socketServer.of(namespace).adapter.remoteJoin(socketId, channelId)
// }

// // leave (need improve)
// SocketService.prototype.leave = function (socketId, channelId, namespace = '/') {
//   this.socketServer.of(namespace).adapter.remoteLeave(socketId, channelId)
// }

// // multi-join (online) (need improve)
// SocketService.prototype.collectiveJoin = function (socketId, channelIdList, namespace = '/') {
//   if (!Array.isArray(channelIdList)) {
//     throw new Error(`channelIdList isn't an array`)
//   }

//   channelIdList.forEach(channelId => {
//     this.socketServer.of(namespace).adapter.remoteJoin(socketId, channelId)
//   })
// }

// // multi-leave (offline) (need improve)
// SocketService.prototype.collectiveLeave = function (socketId, channelIdList, namespace = '/') {
//   if (!Array.isArray(channelIdList)) {
//     throw new Error(`channelIdList isn't an array`)
//   }

//   channelIdList.forEach(channelId => {
//     this.socketServer.of(namespace).adapter.remoteLeave(socketId, channelId)
//   })
// }

SocketService.prototype.associateUser = function (socketId, userId, namespace = '/') {
  this.socketServer.of(namespace).adapter.remoteJoin(socketId, userId)
}

SocketService.prototype.dissociateUser = function (socketId, userId, namespace = '/') {
  this.socketServer.of(namespace).adapter.remoteLeave(socketId, userId)
}

SocketService.prototype.joinChannel = function (userId, channelId, namespace = '/') {
  this.socketServer.in(userId).clients((err, socketIdList) => {
    if (err) {
      throw err
    }

    socketIdList.forEach(socketId => {
      this.socketServer.of(namespace).adapter.remoteJoin(socketId, channelId)
    })
  })
}

SocketService.prototype.joinChannelSync = function (callback, userId, channelId, namespace = '/') {
  this.socketServer.in(userId).clients((err, socketIdList) => {
    if (err) {
      throw err
    }

    Promise.all(socketIdList.map(socketId => this.socketServer.of(namespace).adapter.remoteJoin(socketId, channelId)))
      .then(() => callback())
  })
}

SocketService.prototype.leaveChannel = function (userId, channelId, namespace = '/') {
  this.socketServer.in(userId).clients((err, socketIdList) => {
    if (err) {
      throw err
    }

    socketIdList.forEach(socketId => {
      this.socketServer.of(namespace).adapter.remoteLeave(socketId, channelId)
    })
  })
}

SocketService.prototype.leaveChannelSync = function (callback, userId, channelId, namespace = '/') {
  this.socketServer.in(userId).clients((err, socketIdList) => {
    if (err) {
      throw err
    }

    Promise.all(socketIdList.map(socketId => this.socketServer.of(namespace).adapter.remoteLeave(socketId, channelId)))
      .then(() => callback())
  })
}

SocketService.prototype.onlineChannelList = function (userId, channelIdList, namespace = '/') {
  if (!Array.isArray(channelIdList)) {
    throw new Error(`channelIdList isn't an array`)
  }

  channelIdList.forEach(channelId => {
    this.joinChannel(userId, channelId, namespace)
  })
}

SocketService.prototype.offlineChannelList = function (userId, channelIdList, namespace = '/') {
  if (!Array.isArray(channelIdList)) {
    throw new Error(`channelIdList isn't an array`)
  }

  channelIdList.forEach(channelId => {
    this.leaveChannel(userId, channelId, namespace)
  })
}

// broadcast to all connected sockets
SocketService.prototype.broadcast = function (responseEvent, packet) {
  this.socketServer.sockets.emit(responseEvent, packet)
}

SocketService.prototype.emitInChannel = function (channel, responseEvent, packet) {
  if (Array.isArray(responseEvent)) {
    responseEvent.forEach(resEvent => {
      this.socketServer.sockets.in(channel).emit(resEvent, packet)
    })
  } else if (typeof responseEvent === 'string') {
    this.socketServer.sockets.in(channel).emit(responseEvent, packet)
  } else {
    throw new Error(`The type of responseEvent is illgal`)
  }
}




module.exports = {
  socketService: new SocketService()
}
