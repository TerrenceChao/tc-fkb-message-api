const path = require('path')
const config = require('config')

var Conversation = require(path.join(config.get('database.nosql.model'), 'Conversation'))

function getAttributes (doc) {
  return {
    ciid: doc.ciid,
    sender: doc.sender,
    content: doc.content,
    type: doc.type,
    datetime: doc.datetime
  }
}

function ConversationRepository () {}

ConversationRepository.prototype.create = async function (ciid, uid, content, type, datetime) {
  var conversation = await new Conversation({
    ciid,
    sender: uid,
    content,
    type,
    datetime,
    createdAt: Date.now()
  })
    .save()

  return getAttributes(conversation)
}

ConversationRepository.prototype.getListByCiid = async function (ciid, limit, skip = 0, sort = 'DESC') {
  var list = await Conversation.find({
    ciid
  })
    .sort({
      datetime: sort.toLowerCase()
    })
    .select(['ciid', 'sender', 'content', 'type', 'datetime'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
}

ConversationRepository.prototype.removeListByCiid = async function (ciid) {
  var confirm = await Conversation.deleteMany({
    ciid
  })

  return confirm.ok === 1
}

module.exports = new ConversationRepository()
