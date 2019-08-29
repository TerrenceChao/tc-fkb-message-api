
function InvitationRepository () {}

InvitationRepository.prototype.create = async function (inviter, recipient, header, content, sensitive) {

}

InvitationRepository.prototype.findById = async function (iid) {

}

InvitationRepository.prototype.getListByIds = async function (iidList, limit, skip = 0, sort = 'DESC') {

}

InvitationRepository.prototype.removeById = async function (iid) {

}

module.exports = new InvitationRepository()
