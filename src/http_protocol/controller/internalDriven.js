var config = require('config')
var path = require('path')
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var globalContext = require(path.join(config.get('src.manager'), 'globalContext'))
var recordAuthorization = require(path.join(config.get('src.httpProtocol'), 'util')).recordAuthorization
const BUSINESS_EVENTS = require(path.join(config.get('src.property'), 'property')).BUSINESS_EVENTS


/**
 * ==============================================================
 * obtain authorization:
 * 1. 先透過 validator 驗證欄位, 合法欄位才能取得授權。
 * 2. 尋找使用者，找不到則表示第一次註冊，須建立使用者。
 * 3. 取得授權. (包含 token & refresh-toekn, 其中 refresh-token 須
 *    儲存在資料庫，refresh-token 和 剛找到/建立的使用者為同一筆紀錄。)
 *    
 * TODO: 
 *    考慮使用者可能在多個client端登入，在資料庫中同一個使用者，會出現
 *    [多個成對]的 token & refresh-token
 * ==============================================================
 */
exports.obtainAuthorization = (req, res, next) => {
  Promise.resolve(globalContext.storageService.findOrCreateUser(req.headers.uid, ['uid', 'updatedAt']))
    .then(user => recordAuthorization(user))
    .then(() => globalContext.authService.obtainAuthorization(req.headers))
    .then(authorization => res.locals.data = authorization)
    .then(() => next())
    .catch(err => next(err || new Error(`Error occurred during obtain authorization`)))
}

/**
 * ==============================================================
 * push notification:
 * folk-api => notify-api => message-api(here)
 * ==============================================================
 */
exports.pushNotification = (req, res, next) => {
  let requestInfo = new RequestInfo()
  requestInfo.req = req
  requestInfo.res = res
  requestInfo.next = next
  requestInfo.packet = req.body

  globalContext.businessEvent.emit(BUSINESS_EVENTS.PUSH_NOTIFICATION, requestInfo)
}
