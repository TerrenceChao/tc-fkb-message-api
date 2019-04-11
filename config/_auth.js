require('dotenv').config()

var properties = process.env.AUTH_PROPERTIES.split(',')
var token = properties[properties.length - 1]

module.exports = {
  expiresInMins: process.env.EXPIRES_IN_MINS,
  properties,
  token
}
