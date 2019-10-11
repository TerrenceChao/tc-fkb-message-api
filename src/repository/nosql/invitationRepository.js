const path = require('path')
const config = require('config')

var Invitation = require(path.join(config.get('database.nosql.model'), 'Invitation'))

function getAttributes (doc) {
  return {
    iid: doc._id.toString(),
    inviter: doc.inviter,
    recipient: doc.recipient,
    header: doc.header,
    content: doc.content,
    sensitive: doc.sensitive
  }
}

function InvitationRepository () { }

InvitationRepository.prototype.create = async function (inviter, recipient, header, content, sensitive) {
  var invitation = await new Invitation({
    inviter,
    recipient,
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
    .select(['inviter', 'recipient', 'header', 'content', 'sensitive'])
    .limit(limit)
    .skip(skip)

  return list.map(doc => getAttributes(doc))
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
InvitationRepository.prototype.removeById = async function (iid) {
  return new Promise((resolve, reject) => {
    Invitation.findOneAndRemove({ _id: iid }, (err, docInvitation) => {
      if (err) {
        return reject(err)
      }

      // console.log(`${JSON.stringify(docInvitation)}`, `\n`)
      resolve(docInvitation)
    })
  })
}

module.exports = new InvitationRepository()
