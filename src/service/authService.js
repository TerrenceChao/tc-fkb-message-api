var jwt = require('jsonwebtoken')
var crypto = require('crypto')
var config = require('config')

var expiresInHours = config.get('auth.expiresInHours')
var properties = config.get('auth.properties')
var authToken = config.get('auth.token')

/**
 * @private
 * @param {object} payload
 * @param {object} token
 * @returns {boolean}
 */
function hasProperty (payload, token = false) {
  if (typeof payload !== 'object' || payload == null) {
    return false
  }

  if (token === false) {
    properties.pop()
  }

  var hasProp = true
  properties.forEach(prop => {
    if (!payload.hasOwnProperty(prop)) {
      hasProp = false
    }
  })

  return hasProp
}

/**
 * @private
 * @param {object} payload
 * @returns {object}
 */
function getProperty (payload) {
  var data = {}
  properties.forEach(prop => {
    data[prop] = payload[prop]
  })

  return data
}

/**
 * @private
 * @param {object} payload
 * @returns {string}
 */
function secretGenerator (payload) {
  var data = getProperty(payload)

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest()
}

/**
 * @private
 * @param {object} verification
 * @param {object} payload
 * @returns {boolean}
 */
function isValid (verification, payload) {
  var valid = true
  properties.forEach(prop => {
    if (verification[prop] !== payload[prop]) {
      valid = false
    }
  })

  return valid
}

/**
 * @exports
 */
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

  return jwt.sign(
    getProperty(userPayload),
    secretGenerator(userPayload), {
      expiresIn: expiresInHours
    }
  )
}

// X). remove "temporary" user's payload if has { uid: payload },
AuthService.prototype.isAuthenticated = function (userPayload) {
  if (!hasProperty(userPayload, true)) {
    return false
  }

  try {
    var decoded = jwt.verify(userPayload[authToken], secretGenerator(userPayload))
    console.log(`\n\n decoded: ${decoded}`)
    return isValid(decoded, userPayload)
  } catch (err) {
    console.log(JSON.stringify(err))
    return false
  }
}

module.exports = {
  authService: new AuthService()
}
