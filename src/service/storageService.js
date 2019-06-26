var config = require('config')
var path = require('path')

const userRepository = require(path.join(config.get('src.repository'), 'nosql', 'userRepository'))
const invitationRepository = require(path.join(config.get('src.repository'), 'nosql', 'invitationRepository'))
const channelInfoRepository = require(path.join(config.get('src.repository'), 'nosql', 'channelInfoRepository'))
const conversationRepository = require(path.join(config.get('src.repository'), 'nosql', 'conversationRepository'))

function logger (err) {
  console.error(`database error: ${err.message}`)
}

function StorageService () {}

StorageService.prototype.getUser = async function (uid) {
  return Promise.resolve(userRepository.findById(uid))
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

StorageService.prototype.updateLastGlimpse = async function (uid, jsonGlimpses) {
  return Promise.resolve(userRepository.updateLastGlimpse(uid, jsonGlimpses)) // return true
    .catch(err => {
      logger(err)
      return Promise.reject(err)
    })
}

StorageService.prototype.invitationMultiCreated = async function (
  inviter,
  invitees,
  header,
  content,
  sensitive
) {
  if (!Array.isArray(invitees)) {
    throw new TypeError(`param 'invitees' is not an array`)
  }

  return Promise.all(invitees.map(async (invitee) => {
    var invitation = await invitationRepository.create(inviter, invitee, header, content, sensitive)
    await userRepository.recordInvitation(invitation.iid, inviter, invitee) // return true
    await channelInfoRepository.appendInviteeAndReturn(sensitive.chid, invitee) // recorded in chInfo.invitees

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
      invitation.invitee
    ) // return true
    await channelInfoRepository.removeInviteeAndReturn(invitation.sensitive.chid, invitation.invitee)

    return await invitationRepository.removeById(iid) // return true
  } catch (err) {
    logger(err)
    throw new Error(`remove invitation: ${iid} fail`)
  }
}

StorageService.prototype.channelInfoCreated = async function (uid, channelName) {
  // ciid will be saved in local storage (for frontend)
  try {
    var now = Date.now()
    var channelInfo = await channelInfoRepository.create(uid, channelName)
    // add channel ref(channel record) in User
    await userRepository.appendChannelRecord(
      uid, {
        ciid: channelInfo.ciid,
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
  // get ciid(s) !!! (for internal online/offline procedure)
  return Promise.resolve(userRepository.getChannelRecordList(uid))
    .then(channelRecords => channelRecords.map(chRecord => chRecord.ciid))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`fail to get user's all channel ciid(s). user: ${uid}`))
    })
}

StorageService.prototype.getChannelInfo = async function (query) {
  // ciid will be saved in local storage (for frontend)
  try {
    return await channelInfoRepository.findOne(query)
  } catch (err) {
    logger(err)
    throw new Error(`couldn't get channel info with: ${JSON.stringify(query, null, 2)}`)
  }
}

StorageService.prototype.getUserChannelInfoList = async function (uid, limit = 10, skip = 0) {
  // order by conversation's 'createdAt' DESC
  return Promise.resolve(userRepository.getChannelRecordList(uid))
    // the latest news should comes from channelInfo(channelInfo.latestSpoke), not user self
    .then(async channelRecords => {
      var ciids = channelRecords.map(chRecord => chRecord.ciid)
      var channelInfoList = await channelInfoRepository.getListByCiids(ciids, limit, skip, 'DESC')

      return channelInfoList.map(channelInfo => {
        var chRecord = channelRecords.find(chRecord => chRecord.ciid === channelInfo.ciid)
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
    // In channelInfo(chid): remove uid from invitees, append uid to members.
    var channelInfo = await channelInfoRepository.appendMemberAndReturn(chid, uid)
    // add channel ref(channel record) in User
    await userRepository.appendChannelRecord(
      uid, {
        ciid: channelInfo.ciid,
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
        ciid: channelInfo.ciid,
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
    await conversationRepository.removeListByCiid(channelInfo.ciid) // return true
    await channelInfoRepository.removeByCiid(channelInfo.ciid) // return true
    return true
  } catch (err) {
    logger(err)
    throw new Error(`channel is failed to remove. channel info (queried by ${JSON.stringify(query, null, 2)})`)
  }
}

// for channel => conversations
StorageService.prototype.conversationCreated = async function (ciid, uid, content, type, datetime) {
  return Promise.resolve(conversationRepository.create(ciid, uid, content, type, datetime))
    .then(() => channelInfoRepository.updateLatestSpoke(ciid, datetime)) // ???
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`conversation in channelInfo(ciid): ${ciid} is failed to created`))
    })
}

StorageService.prototype.getConversationList = async function (uid, ciid, limit = 10, skip = 0) {
  return Promise.resolve(userRepository.getChannelRecord(uid, {
    ciid
  }))
    .then(chRecord => conversationRepository.getListByUserChannelRecord(chRecord, limit, skip, 'DESC'))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`get conversations in channel(ciid): ${ciid} FAIL`))
    })
}

module.exports = {
  storageService: new StorageService()
}
