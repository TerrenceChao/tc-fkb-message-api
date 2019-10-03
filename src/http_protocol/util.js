const _ = require('lodash')

/**
 * 
 * @param {Object} user 
 */
function recordAuthorization(user) {
  user.createdAt ?
    console.log(`\nauthorize to newborn:\n`, user, `\n`) :
    console.log(`client gets authorization`, user)
}

module.exports = {
  recordAuthorization,
}