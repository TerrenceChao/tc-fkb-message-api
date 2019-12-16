/** 測試連線用 */
const MSG_CODE_TEST = '0000000'

/** 成功代碼 (在未定義 msgCode 的情況下的成功訊息) */
const MSG_CODE_SUCCESS = '1000000'

/** 錯誤代碼 (在未定義 msgCode 的情況下的錯誤訊息) */
const MSG_CODE_FAIL = '9999999'

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {function} next
 */
function checkResponse (req, res, next) {
  res.json({
    data: {
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    },
    meta: {
      msgCode: MSG_CODE_TEST,
      msg: 'ok'
    }
  })
}

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {function} next
 */
function success (req, res, next) {
  if (res.locals.meta) {
    res.locals.meta.msgCode = res.locals.meta.msgCode || MSG_CODE_SUCCESS
    res.locals.meta.msg = res.locals.meta.msg || arguments.callee.name
  } else {
    res.locals.meta = {
      msgCode: MSG_CODE_SUCCESS,
      msg: arguments.callee.name
    }
  }

  res.status(200).json(res.locals)
}

/**
 *
 * @param {request} req
 * @param {response} res
 * @param {function} next
 */
function createdSuccess (req, res, next) {
  if (res.locals.meta) {
    res.locals.meta.msgCode = res.locals.meta.msgCode || MSG_CODE_SUCCESS
    res.locals.meta.msg = res.locals.meta.msg || arguments.callee.name
  } else {
    res.locals.meta = {
      msgCode: MSG_CODE_SUCCESS,
      msg: arguments.callee.name
    }
  }

  res.status(201).json(res.locals)
}

/**
 *
 * @param {Error} err
 * @param {request} req
 * @param {response} res
 * @param {function} next
 */
function errorHandler (err, req, res, next) {
  res.locals.meta = {
    msgCode: err.msgCode || MSG_CODE_FAIL,
    error: err.message
  }

  res.status(err.statusCode || 500).json(res.locals)
}

module.exports = {
  checkResponse,
  success,
  createdSuccess,
  errorHandler
}
