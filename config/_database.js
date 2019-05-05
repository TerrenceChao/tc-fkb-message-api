const path = require('path')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

var writeConcern = {
  w: process.env.MONGODB_WRITE_CONCERN_W,
  j: JSON.parse(process.env.MONGODB_WRITE_CONCERN_J),
  wtimeout: process.env.MONGODB_WRITE_CONCERN_WTIMEOUT
}

mongoose.envParams = {
  writeConcern
}

const HOST = process.env.MONGODB_HOST
const POOL_SIZE = process.env.MONGODB_POOL_SIZE
const CONNECT = 'req_connect'
const DISCONNECT = 'req_disconnect'

mongoose.connection.once(CONNECT, (host = null) => {
  host = (host === null) ? HOST : host
  mongoose.connect(host, {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: false
  })
})

mongoose.connection.once(DISCONNECT, () => {
  mongoose.disconnect()
})

mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
mongoose.connection.once('open', () => {
  console.log('mongodb is connecting ...')
})

mongoose.connection.once('disconnected', () => {
  console.log('mongodb is disconnected')
})

module.exports = function (root) {
  var database = path.join(root, 'infrastructure', 'database')
  var nosql = path.join(database, 'nosql')
  var sql = path.join(database, 'sql')

  return {
    nosql: {
      host: HOST,
      poolSize: POOL_SIZE,
      connect: CONNECT,
      disconnect: DISCONNECT,
      factory: path.join(nosql, 'factory'),
      model: path.join(nosql, 'model'),
      Seed: path.join(nosql, 'seed')
    },
    sql: {
      factory: path.join(sql, 'factory'),
      model: path.join(sql, 'model'),
      Seed: path.join(sql, 'seed')
    }
  }
}
