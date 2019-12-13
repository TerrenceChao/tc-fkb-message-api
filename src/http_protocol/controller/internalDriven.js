var _ = require('lodash')
var config = require('config')
var path = require('path')
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var recordAuthorization = require(path.join(config.get('src.httpProtocol'), 'util')).recordAuthorization
const BUSINESS_EVENTS = require(path.join(config.get('src.property'), 'property')).BUSINESS_EVENTS

/**
 * ==============================================================
 * create user:
 * 1. 先透過 validator 驗證欄位, 合法欄位才能建立使用者且取得授權。
 * 2. 第一次註冊，須建立使用者。
 * 3. 取得授權. (包含 token, 但 refresh-token 須儲存在資料庫，
 *    refresh-token 和 剛找到/建立的使用者為同一筆紀錄。)
 *
 * TODO:
 *    考慮使用者可能在多個client端登入，在資料庫中同一個使用者，會出現
 *    [多個成對]的 token & refresh-token
 * ==============================================================
 */
exports.createUser = (req, res, next) => {
  const userInfo = {
    uid: req.headers.uid,
    info: req.body.info
  }
  Promise.resolve(globalContext.storageService.createUserInfo(userInfo, ['uid', 'info', 'updatedAt']))
    .then(user => recordAuthorization(user))
    .then(() => globalContext.authService.obtainAuthorization(req.headers))
    .then(authorization => (res.locals.data = authorization))
    .then(() => next())
    .catch(err => next(err || new Error('Error occurred during create user')))
}

/**
 * ==============================================================
 * update user:
 * folk-api => notify-api => message-api(here)
 * ==============================================================
 */
exports.updateUser = (req, res, next) => {
  const uid = req.headers.uid
  const info = req.body.info
  Promise.resolve(globalContext.storageService.updateUserInfo(uid, info, ['uid', 'info', 'updatedAt']))
    .then(user => (res.locals.data = user))
    .then(() => next())
    .catch(err => next(err || new Error('Error occurred during update user')))
}

/**
 * ==============================================================
 * obtain authorization:
 * 1. 先透過 validator 驗證欄位, 合法欄位才能取得授權。
 * 2. 尋找使用者。
 * 3. 取得授權. (包含 token, 但 refresh-token 須儲存在資料庫，
 *    refresh-token 和 剛找到/建立的使用者為同一筆紀錄。)
 *
 * TODO: 
 *    考慮使用者可能在多個client端登入，在資料庫中同一個使用者，會出現
 *    [多個成對]的 token & refresh-token
 * ==============================================================
 */
exports.obtainAuthorization = (req, res, next) => {
  Promise.resolve(globalContext.storageService.getUser(req.headers.uid, ['uid', 'info', 'updatedAt']))
    .then(user => recordAuthorization(user))
    .then(() => globalContext.authService.obtainAuthorization(req.headers))
    .then(authorization => (res.locals.data = authorization))
    .then(() => next())
    .catch(err => next(err || new Error('Error occurred during obtain authorization')))
}

/**
 * ==============================================================
 * push notification:
 * folk-api => notify-api => message-api(here)
 * ==============================================================
 */
exports.pushNotification = (req, res, next) => {
  const requestInfo = new RequestInfo()
  requestInfo.req = req
  requestInfo.res = res
  requestInfo.next = next
  requestInfo.packet = req.body

  globalContext.businessEvent.emit(BUSINESS_EVENTS.PUSH_NOTIFICATION, requestInfo)
}
