const jwt = require('jsonwebtoken')
const SECRET = require('config').get('JWT_SECRET')

function AuthService () {}

AuthService.prototype.authorized = function (packet) {
  // return TRUE if the sessionID in redis is matched with user
  return true
}

// for auth
AuthService.prototype.obtainAuthorization = function (userPayload) {
  const msgToken = jwt.sign(userPayload, SECRET)
  return msgToken
}

// X). remove "temporary" user's payload if has { uid: payload },
AuthService.prototype.isAuthenticated = function (packet) {
  // const payLoad = jwt.verify(msgToken, SECRET)
  return true
}

module.exports = {
  authService: new AuthService()
}
