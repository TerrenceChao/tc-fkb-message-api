var config = require('config')
var path = require('path')

// const { cache } = require(path.join(config.get('cache'), 'cache'));
// const {
//   repository
// } = require(path.join(config.get('database'), 'repository'))

function StorageServiceTemplate () {}

//   var invitations = []
//   invitations = recipients.map(invi => {
//     return {
//       // Avoid creating repeat items
//       iid: `${invi}.encrypt(${chid}, ${invi}, secret?)`,
//       inviter,
//       recipient: invi,
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
//    * 2. for 'channelInfo': insert recipient = 'uid' (type string or Array) into channelInfo(schema)
//    *      Model.update(...)
//    * 3. for 'recipient': insert 'iid' into UserInChannel.receivedInvitations(schema)
//    *      Model.update(...)
//    * 4. for 'inviter': insert 'iid' into UserInChannel.sentInvitations(schema):
//    *      Model.update(...)
//    * 5. note: what if failed ?
//    */

//   return invitations || []
// }

const TESTED_UID = 'xxx-xxx-xxx'

StorageServiceTemplate.prototype.getUser = async function (uid) {
  var user = {
    uid,
    receivedInvitations: [],
    sentInvitations: [],
    channelRecords: {}, // OR [] ???
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }
  return user
  // throw err
}

StorageServiceTemplate.prototype.createUser = async function (uid) {
  return true || false
  // throw err
}

StorageServiceTemplate.prototype.updateLastGlimpse = async function (uid, jsonGlimpses) {
  // assume "jsonObjCopy" is "jsonGlimpses"
  var jsonObjCopy = {
    ciidA: Date.now(),
    ciidB: Date.now(),
    ciidC: Date.now()
  }

  return true
}

StorageServiceTemplate.prototype.invitationMultiCreated = async function (
  inviter,
  recipients,
  header,
  content,
  sensitive
) {
  return [{
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter,
    recipient: TESTED_UID || recipients[0] || 'recipient?',
    header,
    content,
    sensitive,
    create_at: Date.now()
  }, {
    iid: 'vfgty78iolkmnhgtrfdcvbhjkjmn',
    inviter,
    recipient: recipients[1] || 'recipient?',
    header,
    content,
    sensitive,
    create_at: Date.now()
  }]
  // throw new Error(`create invitation(s) fail`)
}

StorageServiceTemplate.prototype.getInvitation = async function (iid) {
  return {
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter: 'inviter?',
    recipient: TESTED_UID,
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

StorageServiceTemplate.prototype.getReceivedInvitationList = async function (uid, limit = 10, skip = 0) {
  // get invitations where "recipient" is uid
  return [{
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter: 'ruby',
    recipient: TESTED_UID,
    header: {
      requestEvent: 'req_invitation_deal_with_invitation',
      data: {
        channelName: 'Night Bar'
      }
    },
    content: 'HTML string',
    sensitive: {
      chid: 'chid: sdfghjklcbvghikliuyuii7g',
      ciid: 'ciid A'
    },
    create_at: Date.now()
  }, {
    iid: '9kjnbvcdrtyuiljhgtloytfghjk',
    inviter: 'summer',
    recipient: TESTED_UID,
    header: {
      requestEvent: 'req_invitation_deal_with_invitation',
      data: {
        channelName: 'Room 18'
      }
    },
    content: 'another HTML string',
    sensitive: {
      chid: 'chid: aert5hewinaslgsi584waesr',
      ciid: 'ciid B'
    },
    create_at: Date.now()
  }] || []
  // throw new Error(`invitationList(received) is null`)
}

StorageServiceTemplate.prototype.getSentInvitationList = async function (uid, limit = 10, skip = 0) {
  // get invitations where "inviter" is uid
  return [{
    iid: 'fyjael5845givsydgvldygrfila',
    inviter: TESTED_UID,
    recipient: 'william',
    header: {
      requestEvent: 'req_invitation_deal_with_invitation',
      data: {
        channelName: 'Night Bar'
      }
    },
    content: 'HTML string',
    sensitive: {
      chid: 'chid: cgh78oluiuefhwrbjsdhfvbas',
      ciid: 'ciid C'
    },
    create_at: Date.now()
  }, {
    iid: 'l8hnadfvbwritgbsi5rgtbirwas',
    inviter: TESTED_UID,
    recipient: 'cathy',
    header: {
      requestEvent: 'req_invitation_deal_with_invitation',
      data: {
        channelName: 'Room 18'
      }
    },
    content: 'another HTML string',
    sensitive: {
      chid: 'chid: fguiodbfmjuytfghjkemngfgh',
      ciid: 'ciid D'
    },
    create_at: Date.now()
  }] || []
  // throw new Error(`invitationList(sent) is null`)
}

// StorageServiceTemplate.prototype.getInvitationThenRemoved = async function (iid) {
//   /**
//    * Database:
//    * 1. query and get (copied obj)
//    * 2. for 'inviter': pull element(iid) from UserInChannel.sentInvitations(schema)
//    * 3. for 'recipient': pull element(iid) from UserInChannel.receivedInvitations(schema)
//    * 4. for 'channelInfo': pull element(uid) from ChannelInfo.recipient(schema)
//    * 5. remove InvitationOfChannel(schema)
//    * 6. return (copied obj)
//    */
//   return {
//     iid: 'mbnht594EokdMvfht54elwTsd98',
//     inviter: 'inviter?',
//     recipient: 'recipient?',
//     header: {},
//     content: 'HTML string',
//     sensitive: {
//       chid: 'chid: aert5hewinaslgsi584waesr',
//       ciid: 'ciid B'
//     },
//     create_at: Date.now()
//   } || false
// }

StorageServiceTemplate.prototype.invitationRemoved = async function (iid) {
  /**
   * Database:
   * 1. query and get (copied obj)
   * 2. for 'inviter': pull element(iid) from UserInChannel.sentInvitations(schema)
   * 3. for 'recipient': pull element(iid) from UserInChannel.receivedInvitations(schema)
   * 4. for 'channelInfo': pull element(uid) from ChannelInfo.recipient(schema)
   * 5. remove InvitationOfChannel(schema)
   */
  return true
  // throw new Error(`remove invitation: ${iid} fail`)
}

// for channel
// 'return null' if channelInfo had has been created.
StorageServiceTemplate.prototype.channelInfoCreated = async function (uid, channelName) {
  // ciid saved in local storage (for frontend)
  return {
    ciid: 'ciid B',
    creator: TESTED_UID,
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    recipients: [],
    members: [TESTED_UID]
  } || null
  // throw new Error(`channel: ${channelName} is failed to create or has been created`)
}

StorageServiceTemplate.prototype.getAllChannelIds = async function (uid) {
  // return ciid !!! (for internal)
  return ['ciid chPub', 'ciid chGasStation', 'ciid chHospital', 'ciid B'] || []
  // throw new Error(`fail to get user's all channel ciid(s). user: ${uid}`)
}

StorageServiceTemplate.prototype.getChannelInfo = async function (queryCondition) {
  // ciid?? saved in local storage (for frontend)
  return {
    ciid: 'ciid B',
    creator: TESTED_UID,
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    recipients: [],
    members: [TESTED_UID, 'uidA', 'uidB', 'uidC']
  }
  // throw new Error(`couldn't get channel info with: ${JSON.stringify(queryCondition, null, 2)}`)
}

StorageServiceTemplate.prototype.getUserChannelInfoList = async function (uid, limit = 10, skip = 0) {
  // order by conversation's 'createdAt' DESC
  return [{
    ciid: 'ciid B',
    creator: 'someone',
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    recipients: [],
    members: [TESTED_UID, 'uidA', 'uidB', 'uidC']
  }, {
    ciid: 'ciid A',
    creator: 'WHO?',
    chid: 'chid:ijmlYIOUYGVUYBK>DFRUTYIHUJNJKTSARFDCVSBUN',
    name: 'Night Bar',
    recipients: [],
    members: [TESTED_UID, 'uidE', 'uidF']
  }] || []
  // throw new Error(`get user's channel list FAIL. user:${uid}`)
}

StorageServiceTemplate.prototype.channelJoined = async function (uid, chid) {
  // In channelInfo(chid): remove uid from recipients, append uid to members.
  return {
    ciid: 'ciid B',
    creator: 'WHO?',
    chid: 'chid:ijmlYIOUYGVUYBK>DFRUTYIHUJNJKTSARFDCVSBUN',
    name: 'Night Bar',
    recipients: [],
    members: [TESTED_UID, 'uidE', 'uidF']
  }
  // throw new Error(`join channel: ${chid} fail. uid: ${uid}`)
}

StorageServiceTemplate.prototype.channelLeaved = async function (uid, chid) {
  // In channelInfo(chid): remove uid from members
  return {
    ciid: 'ciid B',
    creator: 'WHO?',
    chid: 'chid:ijmlYIOUYGVUYBK>DFRUTYIHUJNJKTSARFDCVSBUN',
    name: 'Night Bar',
    recipients: [],
    members: [TESTED_UID, 'uidE', 'uidF']
  }
  // throw new Error(`leave channel: ${chid} fail. uid: ${uid}`)
}

StorageServiceTemplate.prototype.channelInfoRemoved = async function (queryCondition) {
  return true || false
  // throw new Error(`channel: ${queryCondition.chid} is failed to remove`)
}

// for channel => conversations
StorageServiceTemplate.prototype.conversationCreated = function (ciid, uid, content, type, datetime) {
  return true || false
  // throw new Error(`conversation in channelInfo(ciid): ${ciid} is failed to created`)
}

StorageServiceTemplate.prototype.getConversationList = async function (uid, ciid, limit = 10, skip = 0) {
  // get user's (uid) channelRecord & check the time of joinedAt, lastGlimpse
  return [{
    ciid,
    sender: 'Eason',
    content: 'this is a messaging service',
    type: 'text',
    datetime: Date.now(),
    // createdAt: '發送時間和 DB 建立 record 時間會有落差'
  },
  {
    ciid,
    sender: 'Billy',
    content: 'Today is a sunny day',
    type: 'text',
    datetime: Date.now(),
    // createdAt: '發送時間和 DB 建立 record 時間會有落差'
  },
  {
    ciid,
    sender: 'Jessica',
    content: 'Hello world',
    type: 'text',
    datetime: Date.now(),
    // createdAt: '發送時間和 DB 建立 record 時間會有落差'
  }
  ] || []
  // throw new Error(`get conversations in channel(ciid): ${ciid} FAIL`)
}

/**
 * ===================================================
 * for compete/release lock:
 * record in redis/cache, to lock specify resource.
 * ===================================================
 */
// StorageServiceTemplate.prototype.competeLock = function() { }
// StorageServiceTemplate.prototype.releaseLock = function() { }

module.exports = {
  storageService: new StorageServiceTemplate()
}
