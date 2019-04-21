var authProperties = process.env.AUTH_PROPERTIES.split(',')
var lastIndex = authProperties.length - 1
var properties = authProperties.slice(0, lastIndex)
var token = authProperties[lastIndex]

module.exports = {
  expiresIn: process.env.EXPIRES_IN,
  algorithm: process.env.HASH_ALGORITHM,
  authProperties,
  properties,
  token
}
