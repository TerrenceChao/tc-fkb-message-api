function delayFunc (delay, done, err = null) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`func delay ${delay} ms`)
    }, delay)
  })
    .then(msg => {
      console.log(msg)
      done()

      if (err === null) {
        return Promise.resolve(true)
      }

      return Promise.reject(err)
    })
}

function StubSocketService () {
  this.adapter = this

  this.of = function (str) {
    return this
  }
}

StubSocketService.prototype.remoteJoin = function (socketId, roomId) {
  console.log(`socket joined: ${JSON.stringify({
    socketId,
    roomId
  }, null, 2)}`)
}

StubSocketService.prototype.remoteLeave = function (socketId, roomId) {
  console.log(`socket left: ${JSON.stringify({
    socketId,
    roomId
  }, null, 2)}`)
}

StubSocketService.prototype.associateUser = function (socketId, userId, namespace = '/') {
  this.remoteJoin(socketId, userId)
}

StubSocketService.prototype.dissociateUser = function (socketId, userId, namespace = '/') {
  this.remoteLeave(socketId, userId)
}

StubSocketService.prototype.joinChannel = function (userId, channelId, namespace = '/') {
  new Promise((resolve, reject) => {
    this.socketServer.in(userId).clients((err, socketIdList) => {
      if (err) {
        return reject(err)
      }

      socketIdList.forEach(socketId => {
        this.remoteJoin(socketId, channelId)
      })
    })
  })
    .catch(err => console.error('caught', err))
}

StubSocketService.prototype.joinChannelSync = function (callback, userId, channelId, namespace = '/') {
  return new Promise((resolve, reject) => {
    this.socketServer.in(userId).clients((err, socketIdList) => {
      if (err) {
        return reject(err)
      }

      Promise.all(socketIdList.map(socketId => {
        this.remoteJoin(socketId, channelId)
      }))
        .then(() => resolve(callback()))
    })
  })
    .catch(err => console.error('caught', err))
}

StubSocketService.prototype.leaveChannel = function (userId, channelId, namespace = '/') {
  new Promise((resolve, reject) => {
    this.socketServer.in(userId).clients((err, socketIdList) => {
      if (err) {
        return reject(err)
      }

      socketIdList.forEach(socketId => {
        this.remoteLeave(socketId, channelId)
      })
    })
  })
    .catch(err => console.error('caught', err))
}

StubSocketService.prototype.leaveChannelSync = function (callback, userId, channelId, namespace = '/') {
  return new Promise((resolve, reject) => {
    this.socketServer.in(userId).clients((err, socketIdList) => {
      if (err) {
        return reject(err)
      }

      Promise.all(socketIdList.map(socketId => {
        this.remoteLeave(socketId, channelId)
      }))
        .then(() => resolve(callback()))
    })
  })
    .catch(err => console.error('caught', err))
}

StubSocketService.prototype.onlineChannelList = function (userId, channelIdList, namespace = '/') {
  if (!Array.isArray(channelIdList)) {
    throw new Error('channelIdList isn\'t an array')
  }

  channelIdList.forEach(channelId => {
    this.joinChannel(userId, channelId, namespace)
  })
}

StubSocketService.prototype.offlineChannelList = function (userId, channelIdList, namespace = '/') {
  if (!Array.isArray(channelIdList)) {
    throw new Error('channelIdList isn\'t an array')
  }

  channelIdList.forEach(channelId => {
    this.leaveChannel(userId, channelId, namespace)
  })
}

// broadcast to all connected sockets
StubSocketService.prototype.broadcast = function (responseEvent, packet) {
  this.socketServer.sockets.emit(responseEvent, packet)
}

StubSocketService.prototype.emitInChannel = function (channel, responseEvent, packet) {
  if (Array.isArray(responseEvent)) {
    responseEvent.forEach(resEvent => {
      this.socketServer.sockets.in(channel).emit(resEvent, packet)
    })
  } else if (typeof responseEvent === 'string') {
    this.socketServer.sockets.in(channel).emit(responseEvent, packet)
  } else {
    throw new Error('The type of responseEvent is illgal')
  }
}

module.exports = {
  delayFunc,
  stubSocketService: new StubSocketService()
}
