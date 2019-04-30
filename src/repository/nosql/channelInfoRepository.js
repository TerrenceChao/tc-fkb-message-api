const path = require('path')
const config = require('config')
const uuidv4 = require('uuid/v4')

var ChannelInfo = require(path.join(config.get('database.nosql.model'), 'ChannelInfo'))

function getAttributes (doc) {
  return {
    chid: doc._id,
    ciid: doc.ciid,
    name: doc.name,
    creator: doc.creator,
    invitees: doc.invitees,
    members: doc.members,
    latestSpoke: doc.latestSpoke
  }
}

function ChannelInfoRepository () {}

ChannelInfoRepository.prototype.create = async function (uid, channelName) {
  var now = Date.now()
  var channelInfo = await new ChannelInfo({
    ciid: uuidv4(),
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
  if (typeof query.chid !== 'string' && typeof query.ciid !== 'string') {
    throw TypeError('param(s) of query is(are) wrong')
  }

  query._id = query.chid
  delete query.chid
  var channelInfo = await ChannelInfo.findOne(query)
  return getAttributes(channelInfo)
}

ChannelInfoRepository.prototype.getListByCiids = async function (ciids, limit, skip = 0, sort = 'DESC') {
  var list = await ChannelInfo.find({
    ciid: {
      $in: ciids
    }
  })
    .sort({
      latestSpoke: sort.toLowerCase()
    })
    .select(['chid', 'ciid', 'name', 'creator', 'invitees', 'members', 'latestSpoke'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
}

ChannelInfoRepository.prototype.appendMemberAndReturn = async function (chid, uid) {
  const returnNewDoc = {
    new: true
  }

  var now = Date.now()
  // 沒辦法用 getAttributes 取得指定的欄位
  return ChannelInfo.findOneAndUpdate({
    _id: chid
  }, {
    '$pull': {
      'invitees': uid
    },
    '$addToSet': {
      'members': uid
    },
    updatedAt: now
  }, returnNewDoc)
}

ChannelInfoRepository.prototype.removeMemberAndReturn = async function (chid, uid) {
  const returnNewDoc = {
    new: true
  }

  var now = Date.now()
  // 沒辦法用 getAttributes 取得指定的欄位
  return ChannelInfo.findOneAndUpdate({
    _id: chid
  }, {
    '$pull': {
      'members': uid
    },
    updatedAt: now
  }, returnNewDoc)
}

ChannelInfoRepository.prototype.removeByCiid = async function (ciid) {
  var confirm = await ChannelInfo.deleteOne({
    ciid
  })

  return confirm.n === 1 && confirm.ok === 1
}

ChannelInfoRepository.prototype.updateLatestSpoke = async function (ciid, latestSpoke) {
  var confirm = await ChannelInfo.updateOne({
    ciid
  }, {
    latestSpoke,
    updatedAt: Date.now()
  })

  return confirm.n === 1 && confirm.nModified === 1 && confirm.ok === 1
}

module.exports = new ChannelInfoRepository()
