const path = require('path')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.envParams = {
  writeConcern: {
    w: process.env.MONGODB_WRITE_CONCERN_W || 'majority',
    j: JSON.parse(process.env.MONGODB_WRITE_CONCERN_J || true),
    wtimeout: process.env.MONGODB_WRITE_CONCERN_WTIMEOUT || 1000
  }
}

function NosqlShell() {
  this.attempts = 1

  mongoose.connection.on('error', console.error.bind(console, 'connection error:'))
  mongoose.connection.on('open', () => {
    console.log('mongodb is connecting ...')
  })

  mongoose.connection.on('disconnected', () => {
    console.log('\nmongodb is disconnected\n')
    console.log(`re-connectting... attempts: ${this.attempts++}\n`)
    setTimeout(() => {
      this.connect(process.env.MONGODB_HOST)
    }, parseInt(process.env.MONGODB_RECONNECT_INTERVAL))
  })
}

NosqlShell.prototype.db = function () {
  return mongoose
}

NosqlShell.prototype.connect = function (host = null) {
  host = host || process.env.MONGODB_HOST
  mongoose.connect(host, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: false,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: process.env.MONGODB_RECONNECT_INTERVAL || 500,
    poolSize: process.env.MONGODB_POOL_SIZE || 10
  })
}

NosqlShell.prototype.disconnect = function () {
  mongoose.disconnect()
}

module.exports = function (root) {
  var database = path.join(root, 'infrastructure', 'database')
  var nosql = path.join(database, 'nosql')
  var sql = path.join(database, 'sql')

  return {
    nosql: {
      db: new NosqlShell(),
      factory: path.join(nosql, 'factory'),
      model: path.join(nosql, 'model'),
      seed: path.join(nosql, 'seed')
    },
    sql: {
      factory: path.join(sql, 'factory'),
      model: path.join(sql, 'model'),
      seed: path.join(sql, 'seed')
    }
  }
}
