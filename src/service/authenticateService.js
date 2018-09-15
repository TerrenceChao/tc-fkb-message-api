const jwt = require('jsonwebtoken');
const SECRET = require('config').get('JWT_SECRET');

function AuthenticateService() {}

/**
 * ======================================================
 * There's no I/O, 
 *      database, 
 *      NETWORK
 *      or any other non-CPU-bound operations here.
 * 
 * So, there's no async/await .
 * ======================================================
 */

// for auth
AuthenticateService.prototype.unauthenticated = function(userPayload) {
    const MS_TOKEN = jwt.sign(userPayload, SECRET);
    return MS_TOKEN;
}

// X). remove "temporary" user's payload if has { uid: payload },
AuthenticateService.prototype.authenticated = function(uid, MS_TOKEN) {
    const payLoad = jwt.verify(MS_TOKEN, SECRET);
    const userId = payLoad._id || payLoad.id || payLoad.uid || payLoad.userId;

    return userId == uid;
}

module.exports = { authenticateService: new AuthenticateService() }