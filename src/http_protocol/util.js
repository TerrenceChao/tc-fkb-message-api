/**
 *
 * @param {Object} user
 */
function recordAuthorization (user) {
  user.createdAt ? console.log('\nauthorize to newborn:\n', user, '\n') : console.log('client gets authorization', user)
}

/**
 *
 * @param {Object} meta
 * @param {Validator|null} validation
 */
function validateError (meta, validation = null) {
  const message = validation ? JSON.stringify(validation.errors.all()) : meta.msg
  const err = new Error(message)

  err.statusCode = meta.statusCode || 422
  err.msgCode = meta.msgCode

  return err
}

function matchRequestEvent (req, res, eventName) {
  if (req === undefined || res === undefined) {
    return false
  }

  return ['headers', 'params', 'query', 'body']
    .find(field => req[field].event === eventName) !== undefined
}

module.exports = {
  recordAuthorization,
  validateError,
  matchRequestEvent
}
