const uidPattern = process.env.UID_PATTERN || `/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i`
const robotPattern = process.env.ROBOT_PATTERN

module.exports = {
  port: process.env.SERVER_PORT,
  uidPattern,
  robotPattern,
}
