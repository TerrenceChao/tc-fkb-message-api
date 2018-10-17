const config = require('config')
const redisAdaptor = require('socket.io-redis')

function adaptor (socketServer) {
  socketServer.adapter(redisAdaptor({
    host: config.get('ADAPTOR_HOST'),
    port: config.get('ADAPTOR_PORT')
  }))
}

module.exports = {
  adaptor
}
