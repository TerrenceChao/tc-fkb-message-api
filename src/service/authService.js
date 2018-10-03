const jwt = require('jsonwebtoken')
const SECRET = require('config').get('JWT_SECRET')

function AuthService () {}

AuthService.prototype.authorized = function (packet) {
  // return TRUE if the sessionID in redis is matched with user
  return true
}

// for auth
AuthService.prototype.obtainAuthorization = function (userPayload) {
  const MS_TOKEN = jwt.sign(userPayload, SECRET)
  return MS_TOKEN
}

// X). remove "temporary" user's payload if has { uid: payload },
AuthService.prototype.isAuthenticated = function (uid, MS_TOKEN) {
  const payLoad = jwt.verify(MS_TOKEN, SECRET)
  const userId = payLoad._id || payLoad.id || payLoad.uid || payLoad.userId

  return userId === uid
}

module.exports = {
  authService: new AuthService()
}
