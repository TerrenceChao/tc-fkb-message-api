var config = require('config')
var path = require('path')

const {
  userRepository,
  invitationRepository,
  channelInfoRepository,
  conversationRepository
} = require(path.join(config.get('src.repository'), 'repository'))

function logger (err) {
  console.error(`database error: ${err.message}`)
}

function StorageService () { }

StorageService.prototype.getUser = async function (uid) {
  return Promise.resolve(userRepository.findById(uid))
    .catch(err => {
      logger(err)
      return Promise.reject(err)
    })
}

StorageService.prototype.createUser = async function (uid) {
  return Promise.resolve(userRepository.create(uid)) // return true
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
    var inviteIds = await userRepository.getReceivedInvitationIds(uid, limit, skip, 'DESC')
    var invitationList = await invitationRepository.getListByIds(inviteIds) // (inviteIds, uid, limit, skip, 'DESC')
    return invitationList
  } catch (err) {
    logger(err)
    throw new Error(`invitationList(received) is null`)
  }
}

StorageService.prototype.getSentInvitationList = async function (uid, limit = 10, skip = 0) {
  return Promise.resolve(userRepository.getSentInvitationIds(uid, limit, skip, 'DESC'))
    .then(inviteIds => invitationRepository.getListByIds(inviteIds)) //  (inviteIds, uid, limit, skip, 'DESC')
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`invitationList(sent) is null`))
    })
}

StorageService.prototype.invitationRemoved = async function (iid) {
  try {
    var invitation = await invitationRepository.getById(iid)
    // remove the iid(s) ref in User
    await userRepository.deleteInvitation(
      invitation.iid,
      invitation.inviter,
      invitation.invitee
    ) // return true
    return await invitationRepository.removeById(iid) // return true
  } catch (err) {
    logger(err)
    throw new Error(`remove invitation: ${iid} fail`)
  }
}

StorageService.prototype.channelInfoCreated = async function (uid, channelName) {
  // ciid will be saved in local storage (for frontend)
  try {
    var channelInfo = await channelInfoRepository.create(uid, channelName)
    // add channel ref(channel record) in User
    await userRepository.appendChannelRecord({
      ciid: channelInfo.ciid,
      chid: channelInfo.chid,
      joined_at: Date.now(),
      last_glimpse: Date.now()
    })
    return channelInfo
  } catch (err) {
    logger(err)
    throw new Error(`channel: ${channelName} is failed to create or has been created`)
  }
}

StorageService.prototype.getAllChannelIds = async function (uid) {
  // get ciid(s) !!! (for internal online/offline procedure)
  return Promise.resolve(userRepository.getChannelRecords(uid)) // (uid, limit, skip, 'DESC')
    .then(channelRecords => channelRecords.map(chRecord => chRecord.ciid))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`fail to get user's all channel ciid(s). user: ${uid}`))
    })
}

StorageService.prototype.getChannelInfo = async function (query) {
  // ciid will be saved in local storage (for frontend)
  try {
    return await channelInfoRepository.find(query)
  } catch (err) {
    logger(err)
    throw new Error(`couldn't get channel info with: ${JSON.stringify(query, null, 2)}`)
  }
}

StorageService.prototype.getUserChannelInfoList = async function (uid, limit = 10, skip = 0) {
  // order by conversation's 'created_at' DESC
  return Promise.resolve(userRepository.getChannelRecords(uid)) // (uid, limit, skip, 'DESC')
    // the latest news should comes from channelInfo(channelInfo.latest_spoke), not user self
    .then(async channelRecords => {
      var ciids = channelRecords.map(chRecord => chRecord.ciid)
      var channelInfoList = await channelInfoRepository.getListByIds(ciids, limit, skip, 'DESC')

      return channelInfoList.map(channelInfo => {
        var chRecord = channelRecords.find(chRecord => chRecord.ciid === channelInfo.ciid)
        channelInfo.last_glimpse = chRecord.last_glimpse
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
    // In channelInfo(chid): remove uid from invitees, append uid to members.
    var channelInfo = await channelInfoRepository.appendMemberAndReturn(chid, uid)
    // add channel ref(channel record) in User
    await userRepository.appendChannelRecord({
      ciid: channelInfo.ciid,
      chid: channelInfo.chid,
      joined_at: Date.now(),
      last_glimpse: Date.now()
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
    await userRepository.removeChannelRecord({
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
    var channelInfo = await channelInfoRepository.find(query)
    await conversationRepository.removeByCiid(channelInfo.ciid) // return true
    await channelInfoRepository.removeById(channelInfo.ciid) // return true
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

StorageService.prototype.getConversationList = async function (ciid, limit = 10, skip = 0) {
  return Promise.resolve(conversationRepository.getListByCiid(ciid, limit, skip, 'DESC'))
    .catch(err => {
      logger(err)
      return Promise.reject(new Error(`get conversations in channel(ciid): ${ciid} FAIL`))
    })
}

module.exports = {
  storageService: new StorageService()
}
