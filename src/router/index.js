var config = require('config')
var path = require('path')
var routeIndex = require('express').Router()
var generalReq = require(path.join(config.get('src.httpProtocol'), 'request', 'generalReq'))
var internalDriven = require(path.join(config.get('src.httpProtocol'), 'controller', 'internalDriven'))
var generalRes = require(path.join(config.get('src.httpProtocol'), 'response', 'generalRes'))
const BUSINESS_EVENTS = require(path.join(config.get('src.property'), 'property')).BUSINESS_EVENTS

routeIndex.get('/index', generalRes.checkResponse)

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
routeIndex.get(`/${BUSINESS_EVENTS.AUTHENTICATE}`,
  generalReq.authenticateValidator,
  internalDriven.obtainAuthorization,
  generalRes.success,
  generalRes.errorHandler
)

/**
 * ==============================================================
 * push notification:
 * folk-api => notify-api => message-api(here)
 * ==============================================================
 */
routeIndex.patch(`/${BUSINESS_EVENTS.PUSH_NOTIFICATION}`,
  generalReq.notificationValidator,
  internalDriven.pushNotification,
  generalRes.success,
  generalRes.errorHandler
)

module.exports = routeIndex
