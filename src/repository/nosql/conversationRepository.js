const path = require('path')
const config = require('config')

var Conversation = require(path.join(config.get('database.nosql.model'), 'Conversation'))

function getAttributes (doc) {
  return {
    chid: doc.chid,
    sender: doc.sender,
    content: doc.content,
    type: doc.type,
    datetime: doc.datetime
  }
}

function ConversationRepository () {}

ConversationRepository.prototype.create = async function (chid, uid, content, type, datetime) {
  var conversation = await new Conversation({
    chid,
    sender: uid,
    content,
    type,
    datetime,
    createdAt: Date.now()
  })
    .save()

  return getAttributes(conversation)
}

ConversationRepository.prototype.getListByChid = async function (chid, limit, skip = 0, sort = 'DESC') {
  var list = await Conversation.find({
    chid
  })
    .sort({
      datetime: sort.toLowerCase()
    })
    .select(['chid', 'sender', 'content', 'type', 'datetime'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
}

ConversationRepository.prototype.getListByUserChannelRecord = async function (chRecord, limit, skip = 0, sort = 'DESC') {
  var {
    chid,
    joinedAt
  } = chRecord
  var list = await Conversation.find({
    chid,
    datetime: { $gte: joinedAt }
  })
    .sort({
      datetime: sort.toLowerCase()
    })
    .select(['chid', 'sender', 'content', 'type', 'datetime'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
}

ConversationRepository.prototype.removeListByChid = async function (chid) {
  var confirm = await Conversation.deleteMany({
    chid
  })

  return confirm.ok === 1
}

module.exports = new ConversationRepository()
