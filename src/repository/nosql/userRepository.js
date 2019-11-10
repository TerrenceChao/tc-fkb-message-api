const path = require('path')
const config = require('config')
const mongoose = require('mongoose')
const _ = require('lodash')
const VALID_FIELDS = [
  '_id',
  'uid',
  'receivedInvitations',
  'sentInvitations',
  'channelRecords',
  'updatedAt',
  'createdAt'
]

var User = require(path.join(config.get('database.nosql.model'), 'User'))

function UserRepository () {}

UserRepository.prototype.findById = async function (uid, selectFields = []) {
  selectFields = selectFields.length === 0 ? VALID_FIELDS : _.intersection(VALID_FIELDS, selectFields)
  var user = await User.findOne({
    uid
  })
    .select(selectFields)

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

UserRepository.prototype.updateLastGlimpse = async function (uid, newChRecordList) {
  var now = Date.now()
  var updateChRecordQuery = newChRecordList.map(record => {
    return {
      updateOne: {
        filter: {
          uid,
          'channelRecords.chid': record.chid
        },
        update: {
          '$set': {
            'channelRecords.$.lastGlimpse': record.lastGlimpse
          },
          updatedAt: now
        }
      }
    }
  })

  var updatedResult = await User.bulkWrite(updateChRecordQuery)
  console.log('the result of modify channelReocrds: ', JSON.stringify(updatedResult, null, 2))

  return updatedResult
}

UserRepository.prototype.recordInvitation = async function (iid, inviter, recipient) {
  // return Promise.all([
  //   User.updateOne({ uid: inviter }, { '$addToSet': { 'sentInvitations': mongoose.Types.ObjectId(iid) } }),
  //   User.updateOne({ uid: recipient }, { '$addToSet': { 'receivedInvitations': mongoose.Types.ObjectId(iid) } })
  // ])
  //   .catch(err => Promise.reject(err))
  var now = Date.now()
  return User.bulkWrite([{
    updateOne: {
      filter: {
        uid: inviter
      },
      update: {
        '$addToSet': {
          'sentInvitations': mongoose.Types.ObjectId(iid)
        },
        updatedAt: now
      }
    }
  },
  {
    updateOne: {
      filter: {
        uid: recipient
      },
      update: {
        '$addToSet': {
          'receivedInvitations': mongoose.Types.ObjectId(iid)
        },
        updatedAt: now
      }
    }
  }
  ])
    .then(res => res.modifiedCount)
}

UserRepository.prototype.deleteInvitation = async function (iid, inviter, recipient) {
  var now = Date.now()
  return User.bulkWrite([{
    updateOne: {
      filter: {
        uid: inviter
      },
      update: {
        '$pull': {
          'sentInvitations': mongoose.Types.ObjectId(iid)
        },
        updatedAt: now
      }
    }
  },
  {
    updateOne: {
      filter: {
        uid: recipient
      },
      update: {
        '$pull': {
          'receivedInvitations': mongoose.Types.ObjectId(iid)
        },
        updatedAt: now
      }
    }
  }
  ])
    .then(res => res.modifiedCount)
}

UserRepository.prototype.getReceivedInvitationIds = async function (uid, limit, skip = 0) {
  return User.findOne({
    uid
  })
    .select('receivedInvitations')
    .then(doc => doc['receivedInvitations'])
    .then(iidList => iidList.reverse().slice(skip, skip + limit))
}

UserRepository.prototype.getSentInvitationIds = async function (uid, limit, skip = 0) {
  return User.findOne({
    uid
  })
    .select('sentInvitations')
    .then(doc => doc['sentInvitations'])
    .then(iidList => iidList.reverse().slice(skip, skip + limit))
}

UserRepository.prototype.getChannelRecord = async function (uid, query) {
  if (typeof query.chid !== 'string') {
    throw TypeError('UserRepository.getChannelRecord: param(s) of query is(are) wrong')
  }

  var doc = await User.findOne({
    uid
  })
    .select('channelRecords')

  return doc['channelRecords'].find(chRecord => chRecord.chid === query.chid)
}

UserRepository.prototype.appendChannelRecord = async function (uid, record) {
  var now = Date.now()
  record.joinedAt = (record.joinedAt == null) ? now : record.joinedAt
  record.lastGlimpse = (record.lastGlimpse == null) ? now : record.lastGlimpse

  var recordedDoc = await this.getChannelRecord(uid, record)
  if (recordedDoc !== undefined) {
    console.log(`channelRecord has been appended: ${JSON.stringify(recordedDoc, null, 2)}`)
    return recordedDoc
  }

  var doc = await User.updateOne({
    uid
  }, {
    '$addToSet': {
      'channelRecords': record
    },
    updatedAt: now
  })

  return doc
}

UserRepository.prototype.removeChannelRecord = async function (uid, record) {
  if (typeof record.chid !== 'string') {
    throw TypeError('UserRepository.removeChannelRecord: param(s) of record is(are) wrong')
  }

  var now = Date.now()
  var doc = await User.updateOne({
    uid
  }, {
    '$pull': {
      'channelRecords': record
    },
    updatedAt: now
  })

  return doc
}

UserRepository.prototype.getChannelRecordList = async function (uid) {
  return User.findOne({
    uid
  })
    .select('channelRecords')
    .then(doc => doc['channelRecords'])
}

module.exports = new UserRepository()
