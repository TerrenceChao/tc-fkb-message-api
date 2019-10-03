var config = require('config')
var path = require('path')

const userRepository = require(path.join(config.get('src.repository'), 'nosql', 'userRepository'))
const invitationRepository = require(path.join(config.get('src.repository'), 'nosql', 'invitationRepository'))
const channelInfoRepository = require(path.join(config.get('src.repository'), 'nosql', 'channelInfoRepository'))
const conversationRepository = require(path.join(config.get('src.repository'), 'nosql', 'conversationRepository'))

function logger (err) {
  console.error(`database error: ${err.message}`)
}

/**
 * 你可能會覺得奇怪，為什 StorageService 中的 repository [不透過注入(DI)方式]？
 * 以往 repository 會透過注入的方式(DI)以方便用替身(stub)測試，
 * 但是請注意：[StorageService本身就是只關注Database的操作]，
 * 所以測試時，請將 StorageService 當作以往的 repository 做單元測試。
 * 
 * 最主要的原因是專案（程式）架構上的差異。這裡不像傳統的：
 * Controller, Service, Repository. 因為大部分的操作跟 socket 有關，
 * 所以專案架構整體採用 Command Pattern 的方式去設計：
 * [Server,Manager,Handler]
 */
function StorageService () {}

StorageService.prototype.getUser = async function (uid, selectFields = []) {
  return Promise.resolve(userRepository.findById(uid, selectFields))
    .catch(err => {
      logger(err)
      return Promise.reject(err)
    })
}

StorageService.prototype.createUser = async function (uid) {
  return Promise.resolve(userRepository.create(uid)) // return user
    .catch(err => {
      logger(err)
      return Promise.reject(err)
    })
}

StorageService.prototype.findOrCreateUser = async function (uid, selectFields = []) {
  return Promise.resolve(this.getUser(uid, selectFields))
    .then(user => user == null ? this.createUser(uid) : user)
}

StorageService.prototype.updateLastGlimpse = async function (uid, jsonGlimpses) {
  return Promise.resolve(userRepository.updateLastGlimpse(uid, jsonGlimpses)) // return true
    .catch(err => {
      logger(err)
      return Promise.reject(err)
    })
}

StorageService.prototype.invitationMultiCreated = async function (
  inviter,
  recipients,
  header,
  content,
  sensitive
) {
  if (!Array.isArray(recipients)) {
    throw new TypeError(`param 'recipients' is not an array`)
  }

  return Promise.all(recipients.map(async (recipient) => {
    var invitation = await invitationRepository.create(inviter, recipient, header, content, sensitive)
    await userRepository.recordInvitation(invitation.iid, inviter, recipient) // return true
    await channelInfoRepository.appendRecipientAndReturn(sensitive.chid, recipient) // recorded in chInfo.recipients

    return invitation
  }))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`create invitation(s) fail`))
    })
}

StorageService.prototype.getInvitation = async function (iid) {
  try {
    return await invitationRepository.findById(iid)
  } catch (err) {
    logger(err)
    throw new Error(`invitation ID(iid) is invalid`)
  }
}

StorageService.prototype.getReceivedInvitationList = async function (uid, limit = 10, skip = 0) {
  try {
    var inviteIds = await userRepository.getReceivedInvitationIds(uid, limit, skip)
    var invitationList = await invitationRepository.getListByIds(inviteIds) // (inviteIds, limit, skip, 'DESC')
    return invitationList
  } catch (err) {
    logger(err)
    throw new Error(`invitationList(received) is null`)
  }
}

StorageService.prototype.getSentInvitationList = async function (uid, limit = 10, skip = 0) {
  return Promise.resolve(userRepository.getSentInvitationIds(uid, limit, skip))
    .then(inviteIds => invitationRepository.getListByIds(inviteIds)) //  (inviteIds, limit, skip, 'DESC')
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`invitationList(sent) is null`))
    })
}

StorageService.prototype.invitationRemoved = async function (iid) {
  try {
    var invitation = await invitationRepository.findById(iid)
    // remove the iid(s) ref in User
    await userRepository.deleteInvitation(
      invitation.iid,
      invitation.inviter,
      invitation.recipient
    ) // return true
    await channelInfoRepository.removeRecipientAndReturn(invitation.sensitive.chid, invitation.recipient)

    return await invitationRepository.removeById(iid) // return true
  } catch (err) {
    logger(err)
    throw new Error(`remove invitation: ${iid} fail`)
  }
}

StorageService.prototype.channelInfoCreated = async function (uid, channelName) {
  // chid will be saved in local storage (for frontend)
  try {
    var now = Date.now()
    var channelInfo = await channelInfoRepository.create(uid, channelName)
    // add channel ref(channel record) in User
    await userRepository.appendChannelRecord(
      uid, {
        chid: channelInfo.chid,
        joinedAt: now,
        lastGlimpse: now
      })
    return channelInfo
  } catch (err) {
    logger(err)
    throw new Error(`channel: ${channelName} is failed to create or has been created`)
  }
}

StorageService.prototype.getAllChannelIds = async function (uid) {
  // get chid(s) !!! (for internal online/offline procedure)
  return Promise.resolve(userRepository.getChannelRecordList(uid))
    .then(channelRecords => channelRecords.map(chRecord => chRecord.chid))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`fail to get user's all channel chid(s). user: ${uid}`))
    })
}

StorageService.prototype.getChannelInfo = async function (query) {
  // chid will be saved in local storage (for frontend)
  try {
    return await channelInfoRepository.findOne(query)
  } catch (err) {
    logger(err)
    throw new Error(`couldn't get channel info with: ${JSON.stringify(query, null, 2)}`)
  }
}

StorageService.prototype.getUserChannelInfo = async function (query) {
  // var { uid, chid } = query. 'chid' will be saved in local storage (for frontend)
  try {
    return await channelInfoRepository.findOneByUser(query)
  } catch (err) {
    logger(err)
    throw new Error(`couldn't get user's channel info with: ${JSON.stringify(query, null, 2)}`)
  }
}

StorageService.prototype.getUserChannelInfoList = async function (uid, limit = 10, skip = 0) {
  // order by conversation's 'createdAt' DESC
  return Promise.resolve(userRepository.getChannelRecordList(uid))
    // the latest news should comes from channelInfo(channelInfo.latestSpoke), not user self
    .then(async channelRecords => {
      var chids = channelRecords.map(chRecord => chRecord.chid)
      var channelInfoList = await channelInfoRepository.getListByChids(chids, limit, skip, 'DESC')

      return channelInfoList.map(channelInfo => {
        var chRecord = channelRecords.find(chRecord => chRecord.chid === channelInfo.chid)
        channelInfo.lastGlimpse = chRecord.lastGlimpse
        return channelInfo
      })
    })
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`get user's channel list FAIL. user:${uid}`))
    })
}

StorageService.prototype.channelJoined = async function (uid, chid) {
  try {
    var now = Date.now()
    // In channelInfo(chid): remove uid from recipients, append uid to members.
    var channelInfo = await channelInfoRepository.appendMemberAndReturn(chid, uid)
    // add channel ref(channel record) in User
    await userRepository.appendChannelRecord(
      uid, {
        chid: channelInfo.chid,
        joinedAt: now,
        lastGlimpse: now
      })
    return channelInfo
  } catch (err) {
    logger(err)
    throw new Error(`join channel: ${chid} fail. uid: ${uid}`)
  }
}

StorageService.prototype.channelLeaved = async function (uid, chid) {
  try {
    // In channelInfo(chid): remove uid from members
    var channelInfo = await channelInfoRepository.removeMemberAndReturn(chid, uid)
    // remove channel ref(channel record) in User
    await userRepository.removeChannelRecord(
      uid, {
        chid: channelInfo.chid
      })
    return channelInfo
  } catch (err) {
    logger(err)
    throw new Error(`leave channel: ${chid} fail. uid: ${uid}`)
  }
}

StorageService.prototype.channelInfoRemoved = async function (query) {
  try {
    var channelInfo = await channelInfoRepository.findOne(query)
    await conversationRepository.removeListByChid(channelInfo.chid) // return true
    await channelInfoRepository.removeByChid(channelInfo.chid) // return true
    return true
  } catch (err) {
    logger(err)
    throw new Error(`channel is failed to remove. channel info (queried by ${JSON.stringify(query, null, 2)})`)
  }
}

// for channel => conversations
StorageService.prototype.conversationCreated = async function (chid, uid, content, type, datetime) {
  return Promise.resolve(conversationRepository.create(chid, uid, content, type, datetime))
    .then(() => channelInfoRepository.updateLatestSpoke(chid, datetime)) // ???
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`conversation in channelInfo(chid): ${chid} is failed to created`))
    })
}

StorageService.prototype.getConversationList = async function (uid, chid, limit = 10, skip = 0) {
  return Promise.resolve(userRepository.getChannelRecord(uid, {
    chid
  }))
    .then(chRecord => conversationRepository.getListByUserChannelRecord(chRecord, limit, skip, 'DESC'))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`get conversations in channel(chid): ${chid} FAIL`))
    })
}

module.exports = {
  storageService: new StorageService()
}
