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

mongoose.connect(HOST, {
  useNewUrlParser: true,
  useCreateIndex: true,
  autoIndex: false
})

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  console.log('mongodb is connecting ...')
})

module.exports = function (root) {
  var database = path.join(root, 'infrastructure', 'database')
  var nosql = path.join(database, 'nosql')
  var sql = path.join(database, 'sql')

  return {
    nosql: {
      host: HOST,
      poolSize: POOL_SIZE,
      factory: path.join(nosql, 'factory'),
      model: path.join(nosql, 'model'),
      Seed: path.join(nosql, 'seed')
    },
    sql: {
      host: 'host',
      poolSize: 0,
      factory: path.join(sql, 'factory'),
      model: path.join(sql, 'model'),
      Seed: path.join(sql, 'seed')
    }
  }
}
