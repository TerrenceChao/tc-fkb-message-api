const path = require('path')
const config = require('config')

var Invitation = require(path.join(config.get('database.nosql.model'), 'Invitation'))

function getAttributes (doc) {
  return {
    iid: doc._id,
    inviter: doc.inviter,
    invitee: doc.invitee,
    header: doc.header,
    content: doc.content,
    sensitive: doc.sensitive
  }
}

function InvitationRepository () { }

InvitationRepository.prototype.create = async function (inviter, invitee, header, content, sensitive) {
  var invitation = await new Invitation({
    inviter,
    invitee,
    header,
    content,
    sensitive,
    createdAt: Date.now()
  })
    .save()

  return getAttributes(invitation)
}

InvitationRepository.prototype.findById = async function (iid) {
  var invitation = await Invitation.findById(iid)
  return getAttributes(invitation)
}

InvitationRepository.prototype.getListByIds = async function (iidList, limit, skip = 0, sort = 'DESC') {
  var list = await Invitation.find({
    _id: {
      $in: iidList
    }
  })
    .sort({
      createdAt: sort.toLowerCase()
    })
    .select(['inviter', 'invitee', 'header', 'content', 'sensitive'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
}

InvitationRepository.prototype.removeById = async function (iid) {
  var confirm = await Invitation.deleteOne({
    _id: iid
  })

  return confirm.n === 1 && confirm.ok === 1
}

module.exports = new InvitationRepository()
