const path = require('path')
const config = require('config')
const mongoose = require('mongoose')

var User = require(path.join(config.get('database.nosql.model'), 'User'))

function UserRepository () {}

UserRepository.prototype.findById = async function (uid) {
  var user = await User.findOne({
    uid
  })

  return user
}

UserRepository.prototype.create = async function (uid) {
  var now = Date.now()
  var user = await new User({
    uid,
    receivedInvitations: [],
    sentInvitations: [],
    channelRecords: [],
    updatedAt: now,
    createdAt: now
  })
    .save()

  return user
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
  var now = Date.now()
  return User.bulkWrite([
    {
      updateOne: {
        filter: { uid: inviter },
        update: {
          '$addToSet': { 'sentInvitations': mongoose.Types.ObjectId(iid) },
          updatedAt: now
        }
      }
    },
    {
      updateOne: {
        filter: { uid: invitee },
        update: {
          '$addToSet': { 'receivedInvitations': mongoose.Types.ObjectId(iid) },
          updatedAt: now
        }
      }
    }
  ])
    .then(res => res.modifiedCount)
}

UserRepository.prototype.deleteInvitation = async function (iid, inviter, invitee) {
  var now = Date.now()
  return User.bulkWrite([
    {
      updateOne: {
        filter: { uid: inviter },
        update: {
          '$pull': { 'sentInvitations': mongoose.Types.ObjectId(iid) },
          updatedAt: now
        }
      }
    },
    {
      updateOne: {
        filter: { uid: invitee },
        update: {
          '$pull': { 'receivedInvitations': mongoose.Types.ObjectId(iid) },
          updatedAt: now
        }
      }
    }
  ])
    .then(res => res.modifiedCount)
}

UserRepository.prototype.getReceivedInvitationIds = async function (uid, limit, skip = 0) {
  // $slice:[SKIP_VALUE, LIMIT_VALUE]}
  return User.findOne({ uid })
    .select('receivedInvitations')
    .where('1 = 1')
    .slice(skip, limit)
    .then(doc => doc['receivedInvitations'])
}

UserRepository.prototype.getSentInvitationIds = async function (uid, limit, skip = 0) {
  // $slice:[SKIP_VALUE, LIMIT_VALUE]}
  return User.findOne({ uid })
    .select('sentInvitations')
    .where('1 = 1')
    .slice(skip, limit)
    .then(doc => doc['sentInvitations'])
}

UserRepository.prototype.appendChannelRecord = async function (uid, record) {
  var now = Date.now()
  record.joinedAt = (record.joinedAt == null) ? now : record.joinedAt
  record.lastGlimpse = (record.lastGlimpse == null) ? now : record.lastGlimpse

  return User.updateOne({ uid }, {
    '$addToSet': { 'channelRecords': record },
    updatedAt: now
  })
}

UserRepository.prototype.removeChannelRecord = async function (uid, record) {
  if (typeof record.chid !== 'string' || typeof record.ciid !== 'string') {
    throw TypeError('param(s) of record is(are) wrong')
  }

  var now = Date.now()
  return User.updateOne({ uid }, {
    '$pull': { 'channelRecords': record },
    updatedAt: now
  })
}

UserRepository.prototype.getChannelRecords = async function (uid) {
  return User.findOne({ uid })
    .select('channelRecords')
    .then(doc => doc['channelRecords'])
}

module.exports = new UserRepository()
