var config = require('config')
var path = require('path')
var _ = require('lodash')

// const { cache } = require(path.join(config.get('cache'), 'cache'));
// const {
//   repository
// } = require(path.join(config.get('database'), 'repository'))

function StorageService () {}

StorageService.prototype.getChannelIds = async function (
  uid,
  limit = 'all',
  skip = 0
) {
  // return chid, not ciid !!! (return ciid is forbidden)
  return ['chPub', 'chGasStation', 'chHospital'] || []
}

StorageService.prototype.getChannelInfo = async function (queryCondition) {
  return {
      ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN',
      creator: 'someone',
      chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
      name: 'Room 18',
      members: ['uidA', 'uidB', 'uidC']
  } || null
}

StorageService.prototype.getReceivedInvitationList = async function (
  uid,
  limit = 'all',
  skip
) {
  return [
    {
      apple: 'an apple a day keeps the doctor away'
    },
    {
      inviteType: 'received invitations from others'
    },
    {}
  ]
}

StorageService.prototype.getSentInvitationList = async function (
  uid,
  limit = 'all',
  skip
) {
  return [
    {
      banana: 'a banana give you power!'
    },
    {
      inviteType: 'sent invitation by me'
    },
    {}
  ]
}

StorageService.prototype.getInviteesHadBeenInvited = function (chid, invitee) {
  var invitedInvitees = ['Rose']
  return invitedInvitees || []
}

StorageService.prototype.invitationMultiCreated = async function (
  inviter,
  invitee,
  header,
  content,
  sensitive = {}
) {
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
      ciid: 'jiodhdgnj4*&^fyguihnkr4elwsdy'
    },
      create_at: Date.now()
  } || null
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
      ciid: 'jiodhdgnj4*&^fyguihnkr4elwsdy'
    },
      create_at: Date.now()
  } || null
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

// for user
StorageService.prototype.addUser = function (uid, options) {
  if (!this.socketServer) {
  }
}

StorageService.prototype.getUser = async function (uid, options) {
  if (!this.socketServer) {
  }
}

StorageService.prototype.removeUser = function (uid, options) {
  if (!this.socketServer) {
  }
}

// // for posts
// /**
//  * when you click likes, leave comments,
//  * the post state will be changed.
//  */
// StorageService.prototype.postUpdated = function() {
//     return /**/;
// }

// for channel
StorageService.prototype.channelCreated = async function () {}

StorageService.prototype.getChannel = async function (uid, type, chKey) {}

StorageService.prototype.channelRemoved = async function () {}

StorageService.prototype.channelJoined = async function () {}

StorageService.prototype.channelLeaved = async function () {}

// for channel => conversations
StorageService.prototype.conversationCreated = function () {}

StorageService.prototype.getConversation = async function () {}

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
