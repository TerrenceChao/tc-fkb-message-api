const PORT = process.env.SERVER_PORT
const DELAY = process.env.DELAY
const RETRY_LIMIT = process.env.RETRY_LIMIT
const TIMEOUT = process.env.TIMEOUT
const UID_PATTERN = process.env.UID_PATTERN || '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
const ROBOT_PATTERN = process.env.ROBOT_PATTERN
const CONFIRM_INVITE = process.env.CONFIRM_INVITE
const CANCEL_INVITE = process.env.CANCEL_INVITE

module.exports = {
  PORT,
  DELAY,
  RETRY_LIMIT,
  TIMEOUT,
  UID_PATTERN,
  ROBOT_PATTERN,
  CONFIRM_INVITE,
  CANCEL_INVITE
}
