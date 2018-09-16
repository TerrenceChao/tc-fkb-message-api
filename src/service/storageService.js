var config = require('config')
var path = require('path')

// const { cache } = require(path.join(config.get('cache'), 'cache'));
const {
  repository
} = require(path.join(config.get('database'), 'repository'))

function StorageService() {}

StorageService.prototype.getChannelInfoIds = async function (limit, skip = 0) {
  return ['chPub', 'chGasStation', 'chHospital']
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

StorageService.prototype.getInvitation = function (uid, type) {

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