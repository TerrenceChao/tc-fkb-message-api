const path = require('path')
const config = require('config')
const mongoose = require('mongoose')

var User = require(path.join(config.get('database.nosql.model'), 'User'))

function UserRepository () {}

UserRepository.prototype.findById = async function (uid) {
  try {
    return await User.findOne({ uid })
  } catch (err) {
    throw err
  }
}

UserRepository.prototype.create = async function (uid) {
  var user = new User({
    uid,
    receivedInvitations: [],
    sentInvitations: [],
    channelRecords: [],
    updatedAt: Date.now(),
    createdAt: Date.now()
  })

  await user.save()

  return true
}

UserRepository.prototype.updateLastGlimpse = async function (uid, jsonGlimpses) {
  // await User.updateOne({
  //   uid,
  //   'channelRecords.': 
  // }, {

  // })

}

UserRepository.prototype.recordInvitation = async function (iid, inviter, invitee) {
  // return Promise.all([
  //   User.updateOne({ uid: inviter }, { '$addToSet': { 'sentInvitations': mongoose.Types.ObjectId(iid) } }),
  //   User.updateOne({ uid: invitee }, { '$addToSet': { 'receivedInvitations': mongoose.Types.ObjectId(iid) } })
  // ])
  //   .catch(err => Promise.reject(err))
  return User.bulkWrite([
    {
      updateOne: {
        filter: { uid: inviter },
        update: { '$addToSet': { 'sentInvitations': mongoose.Types.ObjectId(iid) } }
      }
    },
    {
      updateOne: {
        filter: { uid: invitee },
        update: { '$addToSet': { 'receivedInvitations': mongoose.Types.ObjectId(iid) } }
      }
    }
  ])
    .then(res => res.modifiedCount)
    .catch(err => Promise.reject(err))
}

UserRepository.prototype.deleteInvitation = async function (iid, inviter, invitee) {
  return User.bulkWrite([
    {
      updateOne: {
        filter: { uid: inviter },
        update: { '$pull': { 'sentInvitations': mongoose.Types.ObjectId(iid) } }
      }
    },
    {
      updateOne: {
        filter: { uid: invitee },
        update: { '$pull': { 'receivedInvitations': mongoose.Types.ObjectId(iid) } }
      }
    }
  ])
    .then(res => res.modifiedCount)
    .catch(err => Promise.reject(err))
}

UserRepository.prototype.getReceivedInvitationIds =  function (uid, limit, skip) {
  // $slice:[SKIP_VALUE, LIMIT_VALUE]}
  return User.findOne({ uid })
    .select('receivedInvitations')
    .where('1 = 1')
    .slice(skip, limit)
    .catch(err => Promise.reject(err))
}

UserRepository.prototype.getSentInvitationIds = async function (uid, limit, skip) {
  // $slice:[SKIP_VALUE, LIMIT_VALUE]}
  return User.findOne({ uid })
    .select('sentInvitations')
    .where('1 = 1')
    .slice(skip, limit)
    .catch(err => Promise.reject(err))
}

UserRepository.prototype.appendChannelRecord = async function (uid, record) {
  record.joinedAt = (record.joinedAt == null) ? Date.now() : record.joinedAt
  record.lastGlimpse = (record.lastGlimpse == null) ? Date.now() : record.lastGlimpse

  return User.updateOne({ uid }, {
    '$addToSet': { 'channelRecords': record }
  })
    .catch(err => Promise.reject(err))
}

UserRepository.prototype.removeChannelRecord = async function (uid, record) {
  var { ciid, chid } = record

  return User.updateOne({ uid }, {
    '$pull': { 'channelRecords': { ciid, chid } }
  })
    .catch(err => Promise.reject(err))
}

UserRepository.prototype.getChannelRecords = async function (uid) {
  return User.findOne({ uid })
    .select('channelRecords')
    .catch(err => Promise.reject(err))
}

module.exports = new UserRepository()
