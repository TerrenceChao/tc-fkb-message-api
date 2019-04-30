
function InvitationRepository () {}

InvitationRepository.prototype.create = async function (inviter, invitee, header, content, sensitive) {

}

InvitationRepository.prototype.findById = async function (iid) {

}

InvitationRepository.prototype.getListByIds = async function (iidList, limit, skip, sort = 'DESC') {

}

InvitationRepository.prototype.removeById = async function (iid) {

}

module.exports = new InvitationRepository()
