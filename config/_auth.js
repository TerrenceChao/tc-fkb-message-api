var authAttributes = process.env.AUTH_ATTRIBUTES.split(',')
var accessProperties = authAttributes.reverse()
var token = accessProperties[0]
var properties = authAttributes.slice(1)

module.exports = {
  expiresIn: process.env.EXPIRES_IN,
  algorithm: process.env.HASH_ALGORITHM,
  authAttributes,
  accessProperties,
  properties,
  token
}
