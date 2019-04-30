
function ConversationRepository () {}

ConversationRepository.prototype.create = async function (ciid, uid, content, type, datetime) {

}

ConversationRepository.prototype.getListByCiid = async function (ciid, limit, skip, sort = 'DESC') {

}

ConversationRepository.prototype.removeByCiid = async function (ciid) {

}

module.exports = new ConversationRepository()