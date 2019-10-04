/**
 * 
 * @param {Object} user 
 */
function recordAuthorization(user) {
  user.createdAt ?
    console.log(`\nauthorize to newborn:\n`, user, `\n`) :
    console.log(`client gets authorization`, user)
}

/**
 * 
 * @param {Object} meta
 * @param {Validator|null} validation 
 */
function validateError(meta, validation = null) {
  let message = validation ? JSON.stringify(validation.errors.all()) : meta.msg
  let err = new Error(message)

  err.statusCode = meta.statusCode || 422
  err.msgCode = meta.msgCode

  return err
}

module.exports = {
  recordAuthorization,
  validateError,
}