var config = require('config')
var path = require('path')

// const { cache } = require(path.join(config.get('cache'), 'cache'));
// const {
//   repository
// } = require(path.join(config.get('database'), 'repository'))

function StorageService () {}

//   var invitations = []
//   invitations = invitees.map(invi => {
//     return {
//       // Avoid creating repeat items
//       iid: `${invi}.encrypt(${chid}, ${invi}, secret?)`,
//       inviter,
//       invitee: invi,
//       header,
//       content,
//       sensitive,
//       create_at: Date.now()
//     }
//   })

//   /**
//    * DB insert multiple rows using self-defiend iid (invitation ID):
//    *      e.g. bcrypt
//    * 1. craete InvitationOfChannel(schema):
//    *      Model.insertMany(invitations)
//    * 2. for 'channelInfo': insert invitee = 'uid' (type string or Array) into channelInfo(schema)
//    *      Model.update(...)
//    * 3. for 'invitee': insert 'iid' into UserInChannel.received_invitations(schema)
//    *      Model.update(...)
//    * 4. for 'inviter': insert 'iid' into UserInChannel.sent_invitations(schema):
//    *      Model.update(...)
//    * 5. note: what if failed ?
//    */

//   return invitations || []
// }

StorageService.prototype.invitationMultiCreated = async function (
  inviter,
  invitees,
  header,
  content,
  sensitive
) {
  return [{
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter,
    invitee: invitees[0] || 'invitee?',
    header,
    content,
    sensitive,
    create_at: Date.now()
  }, {
    iid: 'vfgty78iolkmnhgtrfdcvbhjkjmn',
    inviter,
    invitee: invitees[1] || 'invitee?',
    header,
    content,
    sensitive,
    create_at: Date.now()
  }]
  // throw new Error(`create invitation(s) fail`)
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
      ciid: 'ciid B'
    },
    create_at: Date.now()
  }
  // throw new Error(`invitation ID(iid) is invalid`)
}

StorageService.prototype.getReceivedInvitationList = async function (uid, limit = 10, skip = 0) {
  return [{
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter: 'ruby',
    invitee: 'me',
    header: {},
    content: 'HTML string',
    sensitive: {
      chid: 'chid: sdfghjklcbvghikliuyuii7g',
      ciid: 'ciid A'
    },
    create_at: Date.now()
  }, {
    iid: '9kjnbvcdrtyuiljhgtloytfghjk',
    inviter: 'summer',
    invitee: 'me',
    header: {},
    content: 'another HTML string',
    sensitive: {
      chid: 'chid: aert5hewinaslgsi584waesr',
      ciid: 'ciid B'
    },
    create_at: Date.now()
  }] || []
  // throw new Error(`invitationList(received) is null`)
}

StorageService.prototype.getSentInvitationList = async function (uid, limit = 10, skip = 0) {
  return [{
    banana: 'a banana give you power!'
  },
  {
    inviteType: 'sent invitation by me'
  },
  {}
  ] || []
  // throw new Error(`invitationList(sent) is null`)
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
      ciid: 'ciid B'
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
  // throw new Error(`remove invitation: ${iid} fail`)
}

// for channel
// 'return null' if channelInfo had has been created.
StorageService.prototype.channelInfoCreated = async function (uid, channelName) {
  // ciid saved in local storage (for frontend)
  return {
    ciid: 'ciid B',
    creator: uid,
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    invitees: [],
    members: [uid]
  } || null
}

StorageService.prototype.getAllChannelIds = async function (uid) {
  // return ciid !!! (for internal)
  return ['ciid chPub', 'ciid chGasStation', 'ciid chHospital', 'ciid B'] || []
}

StorageService.prototype.getChannelInfo = async function (queryCondition) {
  // ciid?? saved in local storage (for frontend)
  return {
    ciid: 'ciid B',
    creator: 'someone',
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    invitees: [],
    members: ['uidA', 'uidB', 'uidC']
  }
  // throw new Error(`couldn't get channel info with: ${JSON.stringify(queryCondition, null, 2)}`)
}

StorageService.prototype.getUserChannelInfoList = async function (uid, limit = 10, skip = 0) {
  // order by conversation's 'created_at' DESC
  return [{
    ciid: 'ciid B',
    creator: 'someone',
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    invitees: [],
    members: ['uidA', 'uidB', 'uidC']
  }, {
    ciid: 'ciid A',
    creator: 'WHO?',
    chid: 'chid:ijmlYIOUYGVUYBK>DFRUTYIHUJNJKTSARFDCVSBUN',
    name: 'Night Bar',
    invitees: [],
    members: ['uidE', 'uidF']
  }] || []
  // throw Exception OR return null if not found
}

StorageService.prototype.channelJoined = async function (uid, chid) {
  return true
  // throw new Error(`join channel: ${chid} fail. uid: ${uid}`)
}

StorageService.prototype.channelLeaved = async function (uid, chid) {
  return true || false
}

StorageService.prototype.channelInfoRemoved = async function (queryCondition) {
  return true || false
}

// for channel => conversations
StorageService.prototype.conversationCreated = function (ciid, uid, content, type, datetime) {
  return true || false
}

StorageService.prototype.getConversationList = async function (ciid, limit = 10, skip = 0) {
  return [{
    ciid: 'ciid B',
    sender: 'Eason',
    content: 'this is a messaging service',
    type: 'text',
    created_at: Date.now()
  },
  {
    ciid: 'ciid B',
    sender: 'Billy',
    content: 'Today is a sunny day',
    type: 'text',
    created_at: Date.now()
  },
  {
    ciid: 'ciid B',
    sender: 'Jessica',
    content: 'Hello world',
    type: 'text',
    created_at: Date.now()
  }
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
