var config = require('config')
var path = require('path')

// const { cache } = require(path.join(config.get('cache'), 'cache'));
const {
  repository
} = require(path.join(config.get('database'), 'repository'))

function StorageService() {}

StorageService.prototype.getChannelInfoIds = async function (uid, limit = 'all', skip = 0) {
  return ['chPub', 'chGasStation', 'chHospital']
}

StorageService.prototype.getChannelInfoId = async function (channelName) {
  return 'ciid:ansvbvghtrj54mekw&GBNKNde$3@'
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

StorageService.prototype.invitationCreated = function (inviter, invitee, header, content, sensitive = null) {
  return {
    iid: 'mbnht594EokdMvfht54elwTsd98',
    inviter,
    invitee,
    header,
    content,
    sensitive,
    create_at: Date.now()
  }
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