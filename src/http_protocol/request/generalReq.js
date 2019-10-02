const Validator = require('validatorjs')

const HTTP = {
  AUTHENTICATE_RULES: {
    uid: 'required|string',
    clientuseragent: 'required|string'
  },
  PUSH_NOTIFICATION_RULES: {
    receivers: 'required|array',
    event: 'required|string',
    content: 'required'
  }
}

exports.authenticateValidator = function (req, res, next) {
  let validation = new Validator(req.headers, HTTP.AUTHENTICATE_RULES)
  if (validation.fails()) {
    return res.status(422).json({
      msgCode: `200001`,
      msg: `request 'headers' format error`,
      error: validation.errors.all()
    })
  }

  res.locals.data = {}
  next()
}

exports.notificationValidator = function (req, res, next) {
  let validation = new Validator(req.body, HTTP.PUSH_NOTIFICATION_RULES)
  if (validation.fails()) {
    return res.status(422).json({
      msgCode: `200004`,
      msg: `request 'body' format error`,
      error: validation.errors.all()
    })
  }

  res.locals.data = {}
  next()
}