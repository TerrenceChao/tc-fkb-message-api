const config = require('config')
const redis = require('redis')
const redisAdaptor = require('socket.io-redis')
const host = config.get('adaptor.host')
const port = config.get('adaptor.port')
const password = config.get('adaptor.password')

const pub = redis.createClient(port, host, { auth_pass: password })
const sub = redis.createClient(port, host, { auth_pass: password })

function adaptor (socketServer) {
  socketServer.adapter(redisAdaptor({ pubClient: pub, subClient: sub }))
}

module.exports = {
  adaptor
}
