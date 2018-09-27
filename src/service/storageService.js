function StorageService () {}

// for invitation
StorageService.prototype.invitationMultiCreated = async function (inviter, invitee, header, content, sensitive = {}) {
  /**
   * VERY IMPORTANT !!!
   * VERY IMPORTANT !!!
   * VERY IMPORTANT !!!
   * check it first!
   * Don't create over & over again if you have created.
   */

  var chid = sensitive.chid

  /**
   * Database:
   *    1. craete InvitationOfChannel(schema)
   *    2. for 'channelInfo': insert invitee = 'uid' (type string or Array) into channelInfo(schema)
   *    3. for 'invitee': insert 'iid' into UserInChannel.received_invitations(schema)
   *    4. for 'inviter': insert 'iid' into UserInChannel.sent_invitations(schema)
   */
  if (typeof invitee === 'string') {
    invitee = [invitee]
  }

  var invitations = []
  invitations = invitee.map(invi => {
    return {
      // Avoid creating repeat items
      iid: `${invi}.encrypt(${chid}, ${invi}, secret?)`,
      inviter,
      invitee: invi,
      header,
      content,
      sensitive,
      create_at: Date.now()
    }
  })

  /**
   * DB insert multiple rows using self-defiend iid (invitation ID):
   *      e.g. bcrypt
   * 1. craete InvitationOfChannel(schema):
   *      Model.insertMany(invitations)
   * 2. for 'channelInfo': insert invitee = 'uid' (type string or Array) into channelInfo(schema)
   *      Model.update(...)
   * 3. for 'invitee': insert 'iid' into UserInChannel.received_invitations(schema)
   *      Model.update(...)
   * 4. for 'inviter': insert 'iid' into UserInChannel.sent_invitations(schema):
   *      Model.update(...)
   * 5. note: what if failed ?
   */

  return invitations || []
}

StorageService.prototype.getInvitation = async function (iid) {
  return {
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter: 'inviter?',
    invitee: 'invitee?',
    header: {},
    content: 'HTML string',
    sensitive: {
      chid: 'chid: aert5hewinaslgsi584waesr',
      ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN'
    },
    create_at: Date.now()
  } || null
}

StorageService.prototype.getReceivedInvitationList = async function (uid, limit = 'all', skip = 0) {
  return [{
    apple: 'an apple a day keeps the doctor away'
  },
  {
    inviteType: 'received invitations from others'
  },
  {}
  ] || []
}

StorageService.prototype.getSentInvitationList = async function (uid, limit = 'all', skip = 0) {
  return [{
    banana: 'a banana give you power!'
  },
  {
    inviteType: 'sent invitation by me'
  },
  {}
  ] || []
}

StorageService.prototype.getInviteesHadBeenInvited = function (chid, invitee) {
  var invitedInvitees = ['Rose']
  return invitedInvitees || []
}

StorageService.prototype.getInvitationThenRemoved = async function (iid) {
  /**
   * Database:
   * 1. query and get (copied obj)
   * 2. for 'inviter': pull element(iid) from UserInChannel.sent_invitations(schema)
   * 3. for 'invitee': pull element(iid) from UserInChannel.received_invitations(schema)
   * 4. for 'channelInfo': pull element(uid) from ChannelInfo.invitee(schema)
   * 5. remove InvitationOfChannel(schema)
   * 6. return (copied obj)
   */
  return {
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter: 'inviter?',
    invitee: 'invitee?',
    header: {},
    content: 'HTML string',
    sensitive: {
      chid: 'chid: aert5hewinaslgsi584waesr',
      ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN'
    },
    create_at: Date.now()
  } || false
}

StorageService.prototype.invitationRemoved = async function (iid) {
  /**
   * Database:
   * 1. query and get (copied obj)
   * 2. for 'inviter': pull element(iid) from UserInChannel.sent_invitations(schema)
   * 3. for 'invitee': pull element(iid) from UserInChannel.received_invitations(schema)
   * 4. for 'channelInfo': pull element(uid) from ChannelInfo.invitee(schema)
   * 5. remove InvitationOfChannel(schema)
   */
  return true
}

// for channel
// 'return null' if channelInfo had has been created.
StorageService.prototype.channelInfoCreated = async function (uid, channelName) {
  // ciid saved in local storage (for frontend)
  return {
    ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN',
    creator: uid,
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    invitee: [],
    members: [uid]
  } || null
}

StorageService.prototype.getAllChannelIds = async function (uid) {
  // return ciid !!! (for internal)
  return ['ciid:chPub', 'ciid:chGasStation', 'ciid:chHospital', 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN'] || []
}

StorageService.prototype.getChannelInfo = async function (queryCondition) {
  // ciid saved in local storage (for frontend)
  return {
    ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN',
    creator: 'someone',
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    invitee: [],
    members: ['uidA', 'uidB', 'uidC']
  } || null
}

StorageService.prototype.getUserChannelInfo = async function (uid) {
  return [{
    ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN',
    creator: 'someone',
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    invitee: [],
    members: ['uidA', 'uidB', 'uidC']
  }, {
    ciid: 'ciid:nhjyutrifdfl,mgtyk65lr9e8ds7*(PO:l.MK5AEou(ytg',
    creator: 'WHO?',
    chid: 'chid:ijmlYIOUYGVUYBK>DFRUTYIHUJNJKTSARFDCVSBUN',
    name: 'Night Bar',
    invitee: [],
    members: ['uidE', 'uidF']
  }] || []
}

StorageService.prototype.channelJoined = async function (uid, chid) {
  return true || false
}

StorageService.prototype.channelLeaved = async function (uid, chid) {
  return true || false
}

StorageService.prototype.channelInfoRemoved = async function (queryCondition) {
  return true || false
}

// for channel => conversations
StorageService.prototype.conversationCreated = function (ciid, uid, conversation, type, datetime) {
  return true || false
}

StorageService.prototype.getConversationList = async function (ciid, limit = 10, skip = 0) {
  return [
    'this is a messaging service',
    'Today is a sunny day',
    'Hello world'
  ] || []
}

/**
 * ===================================================
 * for compete/release lock:
 * record in redis/cache, to lock specify resource.
 * ===================================================
 */
// StorageService.prototype.competeLock = function() { }
// StorageService.prototype.releaseLock = function() { }

module.exports = {
  storageService: new StorageService()
}
