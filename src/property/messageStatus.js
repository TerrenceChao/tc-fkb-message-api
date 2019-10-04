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
 *  type/format       = 'TX' (型別，格式轉換相關的事件所引起的)
 *  business process  = 'PX' (程式流程, 業務邏輯的事件所引起的)
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

const STR_IGNORED = `Ⓢ:@Ⓢ`
const STR_IGNORED_REGEX = /Ⓢ:@Ⓢ/g
const EXTRA_SYMBOL = `:@`
const SPLIT_SYMBOL = `Ⓢ`


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
    VALIDITY_EXTENDED_SUCCESS: {
      msgCode: '1101100',
      msg: `Validity extended`
    },
    GET_CHANNEL_AND_CONVERSATION_LIST_SUCCESS: {
      msgCode: '1101100',
      msg: `Get channel list with conversations`
    },
    GET_CHANNEL_AND_CONVERSATION_LIST_ERR: function (err) {
      return {
        msgCode: '4101102/4101103',
        error: err.message
      }
    },

    // ChannelManager
    CHANNEL_OFFLINE_INFO: {
      msgCode: '2102300',
      msg: `User ${STR_IGNORED} in channels is offline.`
    },
    CHANNEL_OFFLINE_ERR: function (err) {
      return {
        msgCode: '4102302/4102303',
        error: err.message
      }
    },

    CHANNEL_ONLINE_INFO: {
      msgCode: '2102300',
      msg: `User is ONLINE`
    },
    CHANNEL_ONLINE_ERR: function (err) {
      return {
        msgCode: '4102302/4102303',
        error: err.message
      }
    },
    CHANNEL_CREATED_SUCCESS: {
      msgCode: '1102100',
      msg: `Channel is created`
    },
    CREATE_CHANNEL_ERR: function (err) {
      return {
        msgCode: '4102102/4102103',
        error: err.message
      }
    },
    CHANNEL_LIST_INFO: {
      msgCode: '2102100',
      msg: `User doesn't join any channel yet`
    },
    GET_CHANNEL_LIST_SUCCESS: {
      msgCode: '1102100',
      msg: `Get channel list`
    },
    GET_CHANNEL_LIST_ERR: function (err) {
      return {
        msgCode: '4102103',
        error: err.message
      }
    },
    GET_ONE_CHANNEL_SUCCESS: {
      msgCode: '1102100',
      msg: `Get a specified channel`
    },
    GET_ONE_CHANNEL_ERR: function (err) {
      return {
        msgCode: '4102103',
        error: err.message
      }
    },
    CHANNEL_JOINED_SUCCESS: {
      msgCode: '1102200',
      msg: `User has joined the channel`
    },
    JOIN_CHANNEL_ERR: function (err) {
      return {
        msgCode: '4102202/4102203',
        error: err.message
      }
    },
    CHANNEL_LEFT_SUCCESS: {
      msgCode: '1102100',
      msg: `User has left`
    },
    LEAVE_CHANNEL_ERR: function (err) {
      return {
        msgCode: '4102102/4102103',
        error: err.message
      }
    },
    CHANNEL_REMOVED_SUCCESS: {
      msgCode: '1102300',
      msg: `The channel is removed`
    },
    REMOVE_CHANNEL_ERR: function (err) {
      return {
        msgCode: '4102303',
        error: err.message
      }
    },

    // ConnectionManager


    // ConversationManager
    CONVERSATION_LIST_INFO: {
      msgCode: '2104200',
      msg: `You can start to communicate with others`
    },
    GET_CONVERSATION_LIST_SUCCESS: {
      msgCode: '1104200',
      msg: `Get conversation list`
    },
    GET_CONVERSATION_LIST_ERR: function (err) {
      return {
        msgCode: '4104203',
        error: err.message
      }
    },
    CONVERSATION_SENT_SUCCESS: {
      msgCode: '1104200',
      msg: `Conversation sent`
    },
    SAVE_CONVERSATION_ERR: function (err) {
      return {
        msgCode: '4104203',
        error: err.message
      }
    },

    // InvitationManager
    INVITATION_CANCELED_INFO: {
      msgCode: '2105100',
      msg: `The invitation is canceled by user`
    },
    REPLY_INVITATION_ERR: function (err) {
      return {
        msgCode: '4105103/41051PX',
        error: err.message
      }
    },
    INVITATION_LIST_INFO: {
      msgCode: '2105200',
      msg: `User doesn't have any invitation yet`
    },
    GET_INVITATION_LIST_SUCCESS: {
      msgCode: '1105200',
      msg: `Get invitation list`
    },
    GET_INVITATION_LIST_ERR: function (err) {
      return {
        msgCode: '4105203',
        error: err.message
      }
    },
    INVITATION_REMOVED_SUCCESS: {
      msgCode: '1105200',
      msg: `The invitation is removed`
    },
    REMOVE_INVITATION_ERR: function (err) {
      return {
        msgCode: '4105203',
        error: err.message
      }
    },
    HAS_INVITED_INFO: {
      msgCode: '2105100',
      msg: 'The recipients may have been invited or are members'
    },
    INVITATION_RECEIVED_INFO: {
      msgCode: '2105100',
      msg: `You got an invitation`    
    },
    CHANNEL_OR_INVITATION_DB_ERR: function (err) {
      return {
        msgCode: '4105103',
        error: err.message
      }
    },
    SEND_INVITATION_ERR: function (err) {
      return {
        msgCode: '41051PX',
        error: err.message
      }
    },

    // MessageManager
    NOTIFICATION_PUSHED_INFO: {
      msgCode: '2106300',
      msg: `Notification pushed`   
    },

    // UserManager
    USER_OFFLINE_INFO: {
      msgCode: '2107300',
      msg: `User is offline`   
    },
    USER_ONLINE_INFO: {
      msgCode: '2107300',
      msg: `User is ONLINE`   
    }
  },

  customMetaMsg,
}
