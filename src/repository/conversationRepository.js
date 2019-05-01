
function ConversationRepository () {}

ConversationRepository.prototype.create = async function (ciid, uid, content, type, datetime) {

}

ConversationRepository.prototype.getListByCiid = async function (ciid, limit, skip = 0, sort = 'DESC') {

}

ConversationRepository.prototype.getListByUserChannelRecord = async function (chRecord, limit, skip = 0, sort = 'DESC') {

}

ConversationRepository.prototype.removeListByCiid = async function (ciid) {

}

module.exports = new ConversationRepository()
