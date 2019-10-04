/**
 * 事件層級代碼：
 * @LevelCodes
 *  success = '1' (ex: 取得，建立，更新，刪除，發送...等的成功)
 *  info    = '2' (ex: 通知自己/朋友登入並上線了. 或其他人發送邀請,加入/離開房間的通知...等)
 *  warn    = '3' (隱藏,潛在性的問題，但尚未導致錯誤發生)
 *  error   = '4' (明顯或潛在性的錯誤導致結果失敗，ex: sucess 中的動作失敗)
 *  fatal   = '5' (明顯或潛在性的錯誤導致系統停止運行. ex: DDOS 導致流量過大)
 * 
 * 通訊協定代碼：
 * @ProtocolCodes
 *  socket  = '1'
 *  http    = '2'
 * 
 * Manager代碼：
 * @MnagaerCodes
 *  authentication  = '01'
 *  channel         = '02'
 *  connection      = '03'
 *  conversation    = '04'
 *  invitation      = '05'
 *  message         = '06'
 *  user            = '07'
 * 
 * 不同階段之流程 所引起的事件代碼：
 * 這裡並無區別 http/socket, 另外可參閱 property 中的事件定義.
 * @ProcessStageCodes
 *  request-stage           = '1' ( client 端引起的)
 *  request/business-stage  = '2' (所引起的業務範疇 既屬於 client, 同時也屬於商業邏輯)
 *  business-stage          = '3' (內部商業邏輯引起的)
 *  business/respose-stage  = '4' (所引起的業務範疇 既屬於商業邏輯，同時也涉及 response 部份流程)
 *  response-stage          = '5' (返回 client 端期間引起的. 唯一屬於此類型的是'SendMessageEventHandler')
 * 
 * 不同服務所引起的事件代碼：
 * 若發生[事件層級2以下]的問題 (success:1, info:2)，[只需要no-service(00)]
 * 若發生[事件層級3以上]的問題 (warn:3, error:4, fatal:5) [任何狀態皆有可能(00~XX)]
 * @ServiceCodes
 *  no-service        = '00' (與 service 無關, 或事件層級在 2 以下)
 *  auth service      = '01' (因 auth service 引起的)
 *  socket service    = '02' (因 socket service 引起的)
 *  storage service   = '03' (因 storage service 引起的)
 *  ...
 *  xxx service       = '27' (因 第 67 個 service 引起的)
 *  ...
 * 
 *  unknown           = '??' (無法得知)
 *  multiple services = 'QQ' (2 ~ 多個服務連鎖效應所引起的)
 *  system            = 'XX' (系統本身/伺服器/網路/遠端服務/檔案系統...等物理性因素引起)
 * 
 * 
 * [For-Example]:
 *  http request url: authentication 因格式錯誤未成功 (http status 422)
 *    => error(level) >> http >> authentication >> request-stage >> no-service
 *    =>      4       >>   2  >>       01       >>       1       >>     00
 *    => 組成代碼: 4201100
 */

const _ = require('lodash')

const STR_IGNORED = `%:@%`
const STR_IGNORED_REGEX = /%:@%/g
const EXTRA_SYMBOL = `:@`
const SPLIT_SYMBOL = `%`


// http error categories
const HEADERS_FORMAT_ERR = {
  statusCode: 422,
  msg: `request 'headers' format error`
}
const BODY_FORMAT_ERR = {
  statusCode: 422,
  msg: `request 'body' format error`
}


 /**
  * 透過 params 替換原本 meta 中的訊息後，回傳 meta
  * @param {Object} meta 
  * @param {array} params
  */
function customMetaMsg(meta, params = []) {
  if (params.length === 0) {
    meta.msg = meta.msg.replace(STR_IGNORED_REGEX, '')
    // console.log(`\n meta.msg`, [meta.msg], '\n')
    return meta
  }

  meta.msg = meta.msg 
    .split(SPLIT_SYMBOL)
    .map(seg => seg === EXTRA_SYMBOL ? params.shift() || '' : seg)
    .join('')
  // console.log(`\n meta.msg`, [meta.msg], '\n')

  return meta.msg
}


module.exports = {
  // http 相關的 meta
  HTTP: {
    AUTH_HEADERS_FORMAT_ERR: _.assign(HEADERS_FORMAT_ERR, { msgCode: '4201100' }),
    PUSH_BODY_FORMAT_ERR: _.assign(BODY_FORMAT_ERR, { msgCode: '4206100' }),
  },

  // socket 相關的 meta
  SOCKET: {
    // AuthenticationManager


    // ChannelManager
    CHANNEL_ONLINE_INFO: {
      msgCode: '2102300',
      msg: `user ${STR_IGNORED} in channels is online${STR_IGNORED}.`
    },

    // ConnectionManager

    // ConversationManager

    // InvitationManager
    INVITATION_LIST_SUCCESS: {
      msgCode: '1105200',
      msg: `get invitation list.`
    },

    // MessageManager

    // UserManager
  },

  customMetaMsg,
}
