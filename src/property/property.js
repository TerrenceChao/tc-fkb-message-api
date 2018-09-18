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
  CONNECT: 'skt_connect',
  DISCONNECT: 'disconnect',

  // AuthenticationManager
  AUTHENTICATE: 'req_authentication_authenticate',
  LOGIN: 'req_authentication_login',
  LOGOUT: 'req_authentication_logout',

  // ChannelManager
  GET_CHANNEL_LIST: 'req_channel_get_channel_list',
  COMPETE_LOCK: 'req_channel_compete_lock',
  RELEASE_LOCK: 'req_channel_release_lock',
  CREATE_CHANNEL: 'req_channel_create_channel',
  JOIN_CHANNEL: 'req_channel_join_channel',
  LEAVE_CHANNEL: 'req_channel_leave_channel',
  REMOVE_CHANNEL: 'req_channel_remove_channel',
  SEND_CONVERSATION: 'req_channel_send_conversation',
  GET_CONVERSATION: 'req_channel_get_conversation',

  // InvitationManager
  GET_INVITATION_LIST: 'req_invitation_get_invitation_list',
  SEND_INVITATION: 'req_invitation_send_invitation',
  DEAL_WITH_INVITATION: 'req_invitation_deal_with_invitation',

  // UserManager
  USER_ONLINE: 'req_user_user_online',
  USER_OFFLINE: 'req_user_user_offline',

  // MessageManager
  SERVER_PUSH: 'req_message_server_push',
  SEND_MESSAGE: 'req_message_send_message'

}

const REQUEST_EVENTS = {
  // ConnectionManager
  CONNECT: EVENTS.CONNECT,
  DISCONNECT: EVENTS.DISCONNECT,

  // AuthenticationManager
  LOGIN: EVENTS.LOGIN,
  LOGOUT: EVENTS.LOGOUT,

  // ChannelManager
  GET_CHANNEL_LIST: EVENTS.GET_CHANNEL_LIST,
  COMPETE_LOCK: EVENTS.COMPETE_LOCK,
  RELEASE_LOCK: EVENTS.RELEASE_LOCK,
  CREATE_CHANNEL: EVENTS.CREATE_CHANNEL,
  LEAVE_CHANNEL: EVENTS.LEAVE_CHANNEL,
  SEND_CONVERSATION: EVENTS.SEND_CONVERSATION,
  GET_CONVERSATION: EVENTS.GET_CONVERSATION,

  // InvitationManager
  GET_INVITATION_LIST: EVENTS.GET_INVITATION_LIST,
  SEND_INVITATION: EVENTS.SEND_INVITATION,
  DEAL_WITH_INVITATION: EVENTS.DEAL_WITH_INVITATION,

  // UserManager

  // MessageManager
  SEND_MESSAGE: EVENTS.SEND_MESSAGE

}

const BUSINESS_EVENTS = {
  // ConnectionManager
  DISCONNECT: EVENTS.DISCONNECT,

  // AuthenticationManager
  AUTHENTICATE: EVENTS.AUTHENTICATE,

  // ChannelManager
  RELEASE_LOCK: EVENTS.RELEASE_LOCK,
  JOIN_CHANNEL: EVENTS.JOIN_CHANNEL,
  REMOVE_CHANNEL: EVENTS.REMOVE_CHANNEL,
  SEND_CONVERSATION: EVENTS.SEND_CONVERSATION,
  GET_CONVERSATION: EVENTS.GET_CONVERSATION,

  // UserManager
  USER_ONLINE: EVENTS.USER_ONLINE,
  USER_OFFLINE: EVENTS.USER_OFFLINE,

  // MessageManager
  SERVER_PUSH: EVENTS.SERVER_PUSH,
  SEND_MESSAGE: EVENTS.SEND_MESSAGE

}

const RESPONSE_EVENTS = {
  // client side (respose to client's event):

  // Authentication
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Channel
  CHANNEL_LIST: 'channel_list',
  CHANNEL_CREATED: 'channel_created',
  CHANNEL_LEAVED: 'channel_leaved',
  CHANNEL_REMOVED: 'channel_removed',

  // Channel
  INVITATION_LIST_FROM_CHANNEL: 'invitation_list_from_channel',
  INVITATION_FROM_CHANNEL_TO_ME: `invitation_from_channel_to_me`,
  CONVERSATION_FROM_CHANNEL: 'conversation_from_channel'
}

module.exports = {
  PROTOCOL,
  TO,
  EVENTS,
  REQUEST_EVENTS,
  BUSINESS_EVENTS,
  RESPONSE_EVENTS
}
