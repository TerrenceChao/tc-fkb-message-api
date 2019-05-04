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

function StubSocketServer () {
  this.adapter = this

  this.of = function (str) { 
    return this
  }

  this.remoteJoin = function (socketId, roomId) {
    console.log(`socket joined: ${JSON.stringify({
      socketId,
      roomId
    }, null, 2)}`)
  }

  this.remoteLeave = function (socketId, roomId) {
    console.log(`socket left: ${JSON.stringify({
      socketId,
      roomId
    }, null, 2)}`)
  }
}

module.exports = {
  delayFunc,
  stubSocketServer: new StubSocketServer()
}
