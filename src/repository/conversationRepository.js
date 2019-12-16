
function ConversationRepository () {}

ConversationRepository.prototype.create = async function (chid, uid, content, type, datetime) {

}

ConversationRepository.prototype.getListByChid = async function (chid, limit, skip = 0, sort = 'DESC') {

}

ConversationRepository.prototype.getListByUserChannelRecord = async function (chRecord, limit, skip = 0, sort = 'DESC') {

}

ConversationRepository.prototype.removeListByChid = async function (chid) {

}

module.exports = new ConversationRepository()
