const config = require('config')
const redisAdaptor = require('socket.io-redis')

function adaptor (socketServer) {
  socketServer.adapter(redisAdaptor({
    host: config.get('adaptor.host'),
    port: config.get('adaptor.port')
  }))
}

module.exports = {
  adaptor
}
