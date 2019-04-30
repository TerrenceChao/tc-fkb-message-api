
function UserRepository () {}

UserRepository.prototype.findById = async function (uid) {

}

UserRepository.prototype.create = async function (uid) {

}

UserRepository.prototype.updateLastGlimpse = async function (uid, jsonGlimpses) {

}

UserRepository.prototype.recordInvitation = async function (iid, inviter, invitee) {

}

UserRepository.prototype.deleteInvitation = async function (iid, inviter, invitee) {

}

UserRepository.prototype.getReceivedInvitationIds = async function (uid, limit, skip = 0, sort = 'DESC') {

}

UserRepository.prototype.getSentInvitationIds = async function (uid, limit, skip = 0, sort = 'DESC') {

}

UserRepository.prototype.appendChannelRecord = async function (ciid, chid, joinedAt = null, lastGlimpse = null) {

}

UserRepository.prototype.removeChannelRecord = async function (ciid, chid) {

}

UserRepository.prototype.getChannelRecords = async function (uid) {

}

module.exports = new UserRepository()
