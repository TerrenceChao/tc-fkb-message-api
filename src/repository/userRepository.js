

function UserRepository () { }

UserRepository.prototype.findById = async function (uid) {
  
}
  
UserRepository.prototype.create = async function (uid) {

}

UserRepository.prototype.recordInvitation = async function (iid, inviter, invitee) {

}

UserRepository.prototype.deleteInvitation = async function (iid, inviter, invitee) {

}

UserRepository.prototype.getReceivedInvitationIds = async function (uid, limit, skip, order_asc_desc) {

}

UserRepository.prototype.getSentInvitationIds = async function (uid, limit, skip, order_asc_desc) {

}

UserRepository.prototype.appendChannelRecord = async function (ciid, chid, joined_at, last_glimpse) {

}

UserRepository.prototype.removeChannelRecord = async function (ciid, chid) {

}

UserRepository.prototype.getChannelRecords = async function (uid) {

}

module.exports = {
  userRepository: new UserRepository()
}
