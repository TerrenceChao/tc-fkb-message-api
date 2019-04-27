const PROTOCOL = {
  HTTP: 'http',
  SOCKET: 'socket'
}

const TO = {
  BROADCAST: 'broadcast',
  CHANNEL: 'channel',
  USER: 'user',
  SOCKET: 'socket',
  SOCKET_DISCONNECT: 'socket_disconnect'
}

const EVENTS = {
  // ConnectionManager
  CONNECT: 'service_connect',
  DISCONNECT: 'service_disconnect',

  // AuthenticationManager
  AUTHENTICATE: 'req_authentication_authenticate',
  LOGIN: 'req_authentication_login',
  LOGOUT: 'req_authentication_logout',

  // ChannelManager
  CHANNEL_ONLINE: 'req_channel_channel_online',
  CHANNEL_OFFLINE: 'req_channel_channel_offline',
  GET_CHANNEL_LIST: 'req_channel_get_channel_list',
  CREATE_CHANNEL: 'req_channel_create_channel',
  JOIN_CHANNEL: 'req_channel_join_channel',
  LEAVE_CHANNEL: 'req_channel_leave_channel',
  REMOVE_CHANNEL: 'req_channel_remove_channel',

  // ConversationManager
  COMPETE_LOCK: 'req_conversation_compete_lock',
  RELEASE_LOCK: 'req_conversation_release_lock',
  SEND_CONVERSATION: 'req_conversation_send_conversation',
  GET_CONVERSATION: 'req_conversation_get_conversation',
  // MARK_AS_READ: 'req_conversation_mark_as_read',

  // InvitationManager
  GET_INVITATION_LIST: 'req_invitation_get_invitation_list',
  SEND_INVITATION: 'req_invitation_send_invitation',
  DEAL_WITH_INVITATION: 'req_invitation_deal_with_invitation',
  CONFIRM_INVITATION: 'req_invitation_confirm_invitation',

  // UserManager
  USER_ONLINE: 'req_user_user_online',
  USER_OFFLINE: 'req_user_user_offline',
  // CONFIG_SETTING: '?'

  // MessageManager
  SERVER_PUSH: 'req_message_server_push',
  SEND_MESSAGE: 'req_message_send_message'
}

// Client side (request from client's event)
const REQUEST_EVENTS = {
  // ConnectionManager

  // AuthenticationManager
  LOGIN: EVENTS.LOGIN,
  LOGOUT: EVENTS.LOGOUT,

  // ChannelManager
  GET_CHANNEL_LIST: EVENTS.GET_CHANNEL_LIST,
  CREATE_CHANNEL: EVENTS.CREATE_CHANNEL,

  // [NOTE]: Will be keeped if there's invitation implementation. Otherwise will be removed
  JOIN_CHANNEL: EVENTS.JOIN_CHANNEL,
  LEAVE_CHANNEL: EVENTS.LEAVE_CHANNEL,

  // ConversationManager
  COMPETE_LOCK: EVENTS.COMPETE_LOCK,
  RELEASE_LOCK: EVENTS.RELEASE_LOCK,
  SEND_CONVERSATION: EVENTS.SEND_CONVERSATION,
  GET_CONVERSATION: EVENTS.GET_CONVERSATION,

  // InvitationManager
  GET_INVITATION_LIST: EVENTS.GET_INVITATION_LIST,
  SEND_INVITATION: EVENTS.SEND_INVITATION,
  DEAL_WITH_INVITATION: EVENTS.DEAL_WITH_INVITATION,
  CONFIRM_INVITATION: EVENTS.CONFIRM_INVITATION,

  // UserManager

  // MessageManager
  SEND_MESSAGE: EVENTS.SEND_MESSAGE
}

// Server side (triggered by internal service(s))
const BUSINESS_EVENTS = {
  // ConnectionManager
  // Send and receive permission: fully allowed OR complete prohibition
  CONNECT: EVENTS.CONNECT,
  DISCONNECT: EVENTS.DISCONNECT,

  // AuthenticationManager
  AUTHENTICATE: EVENTS.AUTHENTICATE,

  // ChannelManager
  CHANNEL_ONLINE: EVENTS.CHANNEL_ONLINE,
  CHANNEL_OFFLINE: EVENTS.CHANNEL_OFFLINE,
  JOIN_CHANNEL: EVENTS.JOIN_CHANNEL,
  REMOVE_CHANNEL: EVENTS.REMOVE_CHANNEL,

  // ConversationManager
  RELEASE_LOCK: EVENTS.RELEASE_LOCK,
  SEND_CONVERSATION: EVENTS.SEND_CONVERSATION,
  GET_CONVERSATION: EVENTS.GET_CONVERSATION,

  // InvitationManager
  GET_INVITATION_LIST: EVENTS.GET_INVITATION_LIST,
  DEAL_WITH_INVITATION: EVENTS.DEAL_WITH_INVITATION,

  // UserManager
  USER_ONLINE: EVENTS.USER_ONLINE,
  USER_OFFLINE: EVENTS.USER_OFFLINE,

  // MessageManager
  SERVER_PUSH: EVENTS.SERVER_PUSH,
  SEND_MESSAGE: EVENTS.SEND_MESSAGE
}

// Client side (respose to client's event)
const RESPONSE_EVENTS = {
  // Personal info (to.USER)
  PERSONAL_INFO: 'personal_info',
  EXCEPTION_ALERT: 'exception_alert',

  // Invitation (realtime) (to.USER)
  INVITATION_TO_ME: 'invitation_to_me',
  // Invitation (non-realtime) (to.USER)
  INVITATION_LIST: 'invitation_list',

  // Channel (realtime) (to.USER)
  CHANNEL_CREATED: 'channel_created',
  CHANNEL_REMOVED: 'channel_removed',
  // Channel (realtime) (to.CHANNEL / USER)
  CHANNEL_JOINED: 'channel_joined',
  CHANNEL_LEFT: 'channel_left',
  // Channel (non-realtime) (to.USER)
  CHANNEL_LIST: 'channel_list',

  // Conversation (realtime) (to.CHANNEL)
  CONVERSATION_FROM_CHANNEL: 'conversation_from_channel',
  // Conversation (non-realtime) (to.USER)
  CONVERSATION_LIST: 'conversation_list'
}

module.exports = {
  PROTOCOL,
  TO,
  EVENTS,
  REQUEST_EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
}
