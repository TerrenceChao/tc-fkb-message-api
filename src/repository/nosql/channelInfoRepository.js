const path = require('path')
const config = require('config')
const uuidv4 = require('uuid/v4')

var ChannelInfo = require(path.join(config.get('database.nosql.model'), 'ChannelInfo'))

function getAttributes (doc) {
  return {
    chid: doc._id.toString(),
    name: doc.name,
    creator: doc.creator,
    recipients: doc.recipients,
    members: doc.members,
    latestSpoke: doc.latestSpoke
  }
}

function ChannelInfoRepository () {}

ChannelInfoRepository.prototype.create = async function (uid, channelName) {
  var now = Date.now()
  var channelInfo = await new ChannelInfo({
    name: channelName,
    creator: uid,
    members: [uid],
    latestSpoke: now,
    updatedAt: now,
    createdAt: now
  })
    .save()

  return getAttributes(channelInfo)
}

ChannelInfoRepository.prototype.findOne = async function (query) {
  if (typeof query.chid !== 'string') {
    throw TypeError('ChannelInfoRepository.findOne: param(s) of query is(are) wrong')
  }

  query._id = query.chid
  delete query.chid
  var channelInfo = await ChannelInfo.findOne(query)
  return getAttributes(channelInfo)
}

ChannelInfoRepository.prototype.findOneByUser = async function (query) {
  if (typeof query.uid !== 'string' && typeof query.chid !== 'string') {
    throw TypeError('ChannelInfoRepository.findOneByUser: param(s) of query is(are) wrong')
  }

  var uid = query.uid
  delete query.uid
  query._id = query.chid
  delete query.chid

  var chInfo = await ChannelInfo.findOne(query)

  var targetUserId = chInfo.members.find((member) => uid === member)
  return targetUserId === undefined ? [] : getAttributes(chInfo)
}

ChannelInfoRepository.prototype.getListByChids = async function (chids, limit, skip = 0, sort = 'DESC') {
  var list = await ChannelInfo.find({
    _id: {
      $in: chids
    }
  })
    .sort({
      latestSpoke: sort.toLowerCase()
    })
    .select(['chid', 'name', 'creator', 'recipients', 'members', 'latestSpoke'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
}

ChannelInfoRepository.prototype.appendRecipientAndReturn = async function (chid, uid) {
  const returnNewDoc = {
    new: true
  }

  var now = Date.now()
  var refreshedChInfo = await ChannelInfo.findOneAndUpdate({
    _id: chid
  }, {
    '$addToSet': {
      'recipients': uid
    },
    updatedAt: now
  }, returnNewDoc)

  return getAttributes(refreshedChInfo)
}

ChannelInfoRepository.prototype.removeRecipientAndReturn = async function (chid, uid) {
  const returnNewDoc = {
    new: true
  }

  var now = Date.now()
  var refreshedChInfo = await ChannelInfo.findOneAndUpdate({
    _id: chid
  }, {
    '$pull': {
      'recipients': uid
    },
    updatedAt: now
  }, returnNewDoc)

  return getAttributes(refreshedChInfo)
}

ChannelInfoRepository.prototype.appendMemberAndReturn = async function (chid, uid) {
  const returnNewDoc = {
    new: true
  }

  var now = Date.now()
  var refreshedChInfo = await ChannelInfo.findOneAndUpdate({
    _id: chid
  }, {
    '$pull': {
      'recipients': uid
    },
    '$addToSet': {
      'members': uid
    },
    updatedAt: now
  }, returnNewDoc)

  return getAttributes(refreshedChInfo)
}

ChannelInfoRepository.prototype.removeMemberAndReturn = async function (chid, uid) {
  const returnNewDoc = {
    new: true
  }

  var now = Date.now()
  var refreshedChInfo = await ChannelInfo.findOneAndUpdate({
    _id: chid
  }, {
    '$pull': {
      'members': uid
    },
    updatedAt: now
  }, returnNewDoc)

  return getAttributes(refreshedChInfo)
}

/**
 * [NOTE]:
 * as user3344977 said in comment, the function [deleteOne] and [deleteMany] 
 * no longer exist in mongoose 4. 
 * @The API documentation is not up to date.
 * you can use Model.findOneAndRemove(condition, options, callback) 
 * or Model.findByIdAndRemove(id, options, callback) instead.
 * ref: https://stackoverflow.com/questions/42798869/mongoose-js-typeerror-model-deleteone-is-not-a-function
 */
ChannelInfoRepository.prototype.removeByChid = async function (chid) {
  return new Promise((resolve, reject) => {
    ChannelInfo.findOneAndRemove({ _id: chid }, (err, docChInfo) => {
      if (err) {
        return reject(err)
      }
      
      // console.log(`${JSON.stringify(docChInfo)}`, `\n`)
      resolve(docChInfo)
    })
  })
}

ChannelInfoRepository.prototype.updateLatestSpoke = async function (chid, latestSpoke) {
  var confirm = await ChannelInfo.updateOne({
    chid
  }, {
    latestSpoke,
    updatedAt: Date.now()
  })

  return confirm.n === 1 && confirm.nModified === 1 && confirm.ok === 1
}

module.exports = new ChannelInfoRepository()
