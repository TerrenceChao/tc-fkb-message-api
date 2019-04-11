require('dotenv').config()

var properties = process.env.AUTH_PROPERTIES.split(',')
var token = properties[properties.length - 1]

module.exports = {
  expiresInHours: process.env.EXPIRES_IN_HOURS,
  properties,
  token
}
