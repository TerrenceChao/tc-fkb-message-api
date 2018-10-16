var jwt = require('jsonwebtoken')
var crypto = require('crypto')

const expiresInMins = 30
const properties = ['uid', 'userAgent']
const propertiesWithToken = properties.concat('msgToken')

function hasProperty (payload, token = false) {
  if (typeof payload !== 'object' || payload == null) {
    return false
  }

  var hasProp = true
  if (!token) {
    properties.forEach(prop => {
      if (!payload.hasOwnProperty(prop)) {
        hasProp = false
      }
    })
    return hasProp
  }

  propertiesWithToken.forEach(prop => {
    if (!payload.hasOwnProperty(prop)) {
      hasProp = false
    }
  })
  return hasProp
}

function getProperty (payload) {
  var data = {}
  properties.forEach(prop => {
    data[prop] = payload[prop]
  })
  return data
}

function secretGenerator (payload) {
  var data = getProperty(payload)
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest()
}

function isValid (verification, payload) {
  var valid = true
  properties.forEach(prop => {
    if (verification[prop] !== payload[prop]) {
      valid = false
    }
  })
  return valid
}

function AuthService () {}

AuthService.prototype.authorized = function (packet) {
  // return TRUE if the sessionID in redis is matched with user
  return true
}

// for auth
AuthService.prototype.obtainAuthorization = function (userPayload) {
  if (!hasProperty(userPayload)) {
    return false
  }

  const msgToken = jwt.sign(
    getProperty(userPayload),
    secretGenerator(userPayload),
    { expiresIn: 60 * expiresInMins }
  )
  return msgToken
}

// X). remove "temporary" user's payload if has { uid: payload },
AuthService.prototype.isAuthenticated = function (userPayload) {
  if (!hasProperty(userPayload, true)) {
    return false
  }

  try {
    var msgToken = userPayload.msgToken
    var decoded = jwt.verify(msgToken, secretGenerator(userPayload))
    return isValid(decoded, userPayload)
  } catch (err) {
    console.log(JSON.stringify(err))
    return false
  }
}

module.exports = {
  authService: new AuthService()
}
