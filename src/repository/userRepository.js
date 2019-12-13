function UserRepository () {}

UserRepository.prototype.findById = async function (uid, selectFields) {

}

UserRepository.prototype.getListByIds = async function (uidList) {

}

UserRepository.prototype.createInfo = async function (user) {

}

UserRepository.prototype.updateInfoById = async function (user) {

}

UserRepository.prototype.updateLastGlimpse = async function (uid, newChRecordList) {

}

UserRepository.prototype.recordInvitation = async function (iid, inviter, recipient) {

}

UserRepository.prototype.deleteInvitation = async function (iid, inviter, recipient) {

}

UserRepository.prototype.getReceivedInvitationIds = async function (uid, limit, skip = 0) {

}

UserRepository.prototype.getSentInvitationIds = async function (uid, limit, skip = 0) {

}

UserRepository.prototype.getChannelRecord = async function (uid, query) {

}

UserRepository.prototype.appendChannelRecord = async function (uid, record) {

}

UserRepository.prototype.removeChannelRecord = async function (uid, record) {

}

UserRepository.prototype.getChannelRecordList = async function (uid) {

}

module.exports = new UserRepository()
