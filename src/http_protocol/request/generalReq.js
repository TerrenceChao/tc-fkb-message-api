const path = require('path')
const config = require('config')
const Validator = require('validatorjs')
const validateError = require(path.join(config.get('src.httpProtocol'), 'util')).validateError
const RULES = require(path.join(config.get('src.property'), 'validation')).HTTP
const META = require(path.join(config.get('src.property'), 'messageStatus')).HTTP
const { AUTHENTICATE, PUSH_NOTIFICATION } = require(path.join(config.get('src.property'), 'property')).EVENTS


exports.authenticateValidator = function (req, res, next) {
  res.locals.data = {}

  let validation = new Validator(req.headers, RULES[AUTHENTICATE])
  if (validation.fails()) {
    return next(validateError(META.AUTH_HEADERS_FORMAT_ERR, validation))
  }

  next()
}

exports.notificationValidator = function (req, res, next) {
  res.locals.data = {}

  let validation = new Validator(req.body, RULES[PUSH_NOTIFICATION])
  if (validation.fails()) {
    return next(validateError(META.PUSH_BODY_FORMAT_ERR, validation))
  }

  next()
}
