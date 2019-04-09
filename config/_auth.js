require('dotenv').config()

module.exports = {
  properties: process.env.AUTH_PROPERTIES,
  expiresInMins: process.env.EXPIRES_IN_MINS
}
