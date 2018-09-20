var config = require('config')
var path = require('path')

// const { cache } = require(path.join(config.get('cache'), 'cache'));
const {
  repository
} = require(path.join(config.get('database'), 'repository'))

function StorageService () {}

StorageService.prototype.getChannelInfoIds = async function (uid, limit = 'all', skip = 0) {
  return ['chPub', 'chGasStation', 'chHospital']
}

StorageService.prototype.getChannelInfo = async function (queryCondition) {
  return {
    ciid: 'ciid:ansvbvghtrj54mekw&GBNKNde$3@FIT*IoiTGBK#$%^YHBN',
    creator: 'someone',
    chid: 'chid:l4ehfuvljifgbudvzsugkurliLO4U*T&IYEOW*UGY',
    name: 'Room 18',
    members: ['uidA', 'uidB', 'uidC']
  }
}

StorageService.prototype.getReceivedInvitationList = async function (uid, limit = 'all', skip) {
  return [{
    apple: 'an apple a day keeps the doctor away'
  },
  {
    inviteType: 'received invitations from others'
  },
  {}
  ]
}

StorageService.prototype.getSentInvitationList = async function (uid, limit = 'all', skip) {
  return [{
    banana: 'a banana give you power!'
  },
  {
    inviteType: 'sent invitation by me'
  },
  {}
  ]
}

StorageService.prototype.invitationCreated = async function (inviter, invitee, header, content, sensitive = null) {
  /**
   * VERY IMPORTANT !!!
   * VERY IMPORTANT !!!
   * VERY IMPORTANT !!!
   * check it first!
   * Don't create over & over again if you have created.
   */

  /**
   * Database:
   *    1. craete InvitationOfChannel(schema)
   *    2. insert in UserInChannel.sent_invitations(schema)
   */
  var invitations = []
  if (typeof invitee === 'string') {
    invitations.push({
      // Avoid creating repeat items
      iid: `hashed_or_encoded(${header.data.chid}, ${inviter}, ${invitee}, secret)`,
      inviter,
      invitee,
      header,
      content,
      sensitive,
      create_at: Date.now()
    })
  } else if (Array.isArray(invitee)) {
    invitations = invitee.map(invi => {
      return {
        // Avoid creating repeat items
        iid: `hashed_or_encoded(header.data.chid, inviter, ${invitee}, secret)`,
        inviter,
        invi,
        header,
        content,
        sensitive,
        create_at: Date.now()
      }
    })
  }

  /**
   * DB insert multiple rows using self-defiend iid (invitation ID)
   * 1. craete InvitationOfChannel(schema):
   *      Model.insertMany(invitations)
   * 2. insert in UserInChannel.sent_invitations(schema)
   *      Model.update(...)
   */

  return invitations
}

StorageService.prototype.invitationRemoved = async function (iid) {
  /**
   * Database:
   * 1. remove InvitationOfChannel(schema)
   * 2. pull element in UserInChannel.sent_invitations(schema)
   */
  return true
}

StorageService.prototype.getInvitationThenRemoved = async function (iid) {
  /**
   * Database:
   * 1. query and get (copied obj)
   * 2. remove InvitationOfChannel(schema)
   * 3. pull element in UserInChannel.sent_invitations(schema)
   * 4. return (copied obj)
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

StorageService.prototype.refSocketServer = function (socketServer) {
  this.socketServer = socketServer
  return this
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
StorageService.prototype.channelCreated = async function () {

}

StorageService.prototype.getChannel = async function (uid, type, chKey) {

}

StorageService.prototype.channelRemoved = async function () {

}

StorageService.prototype.channelJoined = async function () {

}

StorageService.prototype.channelLeaved = async function () {

}

// for channel => conversations
StorageService.prototype.conversationCreated = function () {

}

StorageService.prototype.getConversation = async function () {

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
