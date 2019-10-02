/**
 * 
 * @param {request} req 
 * @param {response} res 
 * @param {function} next 
 */
function checkResponse(req, res, next) {
  res.json({
    data: {
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`
    },
    meta: {
      msgCode: '000000',
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
function success(req, res, next) {
  res.locals.meta = {
    msgCode: '100000',
    msg: arguments.callee.name
  }

  res.status(200).json(res.locals)
}

/**
 * 
 * @param {request} req 
 * @param {response} res 
 * @param {function} next 
 */
function createdSuccess(req, res, next) {
  res.locals.meta = {
    msgCode: '100000',
    msg: arguments.callee.name
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
function errorHandler(err, req, res, next) {
  res.locals.meta = {
    msgCode: '999999',
    error: err.message
  }
  
  res.status(err.status || 500).json(res.locals)
}

module.exports = {
  checkResponse,
  success,
  createdSuccess,
  errorHandler
}
