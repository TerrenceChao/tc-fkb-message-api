var path = require('path')
var config = require('config')
var RequestInfo = require(path.join(config.get('src.manager'), 'RequestInfo'))
var ResponseInfo = require(path.join(config.get('src.manager'), 'ResponseInfo'))
const UID_PATTERN = config.get('app.UID_PATTERN')
const TOKEN = config.get('auth.token')
const REFRESH_TOKEN = config.get('auth.refreshToken')
const EVENTS = require(path.join(config.get('src.property'), 'property')).EVENTS


/**
 * 
 * @param {RequestInfo} requestInfo 
 */
function requireUidOnly (requestInfo) {
  return requestInfo.packet != null &&
    requestInfo.packet.uid != null
}


module.exports = {
  HTTP: {
    // AuthenticationManager
    [EVENTS.AUTHENTICATE]: {
      uid: [`required`, `regex:${UID_PATTERN}`],
      clientuseragent: `required|string`
    },
    // MessageManager
    [EVENTS.PUSH_NOTIFICATION]: {
      receivers: `required|array`,
      event: `required|string`,
      content: `required`
    },
  },
  ALL: {
    // AuthenticationManager
    [EVENTS.LOGIN]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.sessionId === 'string' &&
        typeof packet[TOKEN] === 'string' &&
        typeof packet.uid === 'string' &&
        packet.inviLimit != null &&
        packet.chanLimit != null
    },
    [EVENTS.LOGOUT]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        typeof packet.config === 'object'
    },

    // ChannelManager
    [EVENTS.CHANNEL_ONLINE]: function (requestInfo) {
      return requireUidOnly(requestInfo)
    },
    [EVENTS.CHANNEL_OFFLINE]: function (requestInfo) {
      return requireUidOnly(requestInfo)
    },
    [EVENTS.GET_CHANNEL_LIST]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        packet.chanLimit != null
    },
    [EVENTS.GET_ONE_CHANNEL]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        typeof packet.chid === 'string'
    },
    [EVENTS.CREATE_CHANNEL]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        typeof packet.channelName === 'string'
    },
    [EVENTS.JOIN_CHANNEL]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.targetUid === 'string' &&
        typeof packet.nickname === 'string' &&
        typeof packet.chid === 'string'
    },
    [EVENTS.LEAVE_CHANNEL]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.targetUid === 'string' &&
        typeof packet.nickname === 'string' &&
        typeof packet.chid === 'string'
    },
    [EVENTS.REMOVE_CHANNEL]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        packet.chid != null
    },

    // ConnectionManager
    [EVENTS.CONNECT]: function (requestInfo) {
      return requireUidOnly(requestInfo)
    },
    [EVENTS.DISCONNECT]: function (requestInfo) {
      return requireUidOnly(requestInfo)
    },

    // ConversationManager
    [EVENTS.SEND_CONVERSATION]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        packet.chid != null &&
        typeof packet.uid === 'string' &&
        packet.content != null &&
        packet.convType != null
    },
    [EVENTS.GET_CONVERSATION_LIST]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        packet.chid != null &&
        packet.convLimit != null &&
        packet.convSkip != null
    },

    // InvitationManager
    [EVENTS.GET_INVITATION_LIST]: function (requestInfo) {
      return requestInfo.packet != null &&
        requestInfo.packet.uid != null &&
        typeof requestInfo.packet.inviType === 'string' &&
        requestInfo.packet.inviLimit != null
    },
    [EVENTS.SEND_INVITATION]: function (requestInfo) {
      return (
        requestInfo.packet != null &&
        requestInfo.packet.inviter != null &&
        Array.isArray(requestInfo.packet.recipients) &&
        typeof requestInfo.packet.chid === 'string' &&
        requestInfo.packet.content != null
      )
    },
    [EVENTS.DEAL_WITH_INVITATION]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.targetUid === 'string' &&
        typeof packet.nickname === 'string' &&
        typeof packet.iid === 'string' &&
        typeof packet.dealWith === 'string'
    },
    [EVENTS.REMOVE_INVITATION]: function (requestInfo) {
      var packet = requestInfo.packet
      return packet !== undefined &&
        typeof packet.uid === 'string' &&
        typeof packet.iid === 'string'
    },

    // MessageManager
    [EVENTS.SEND_MESSAGE]: function (responseInfo) {
      return responseInfo instanceof ResponseInfo &&
        responseInfo.header != null &&
        typeof responseInfo.header.protocol === 'string' &&
        typeof responseInfo.header.to === 'string' &&
        (typeof responseInfo.header.receiver === 'string' || Array.isArray(responseInfo.header.receiver)) &&
        (typeof responseInfo.header.responseEvent === 'string' || Array.isArray(responseInfo.header.responseEvent))
    },

    // UserManager
    [EVENTS.USER_ONLINE]: function (requestInfo) {
      return requireUidOnly(requestInfo)
    },
    [EVENTS.USER_OFFLINE]: function (requestInfo) {
      return requireUidOnly(requestInfo)
    },

  }
}
