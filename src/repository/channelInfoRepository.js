function ChannelInfoRepository () {}

ChannelInfoRepository.prototype.create = async function (uid, channelName) {

}

ChannelInfoRepository.prototype.findOne = async function (query) {

}

ChannelInfoRepository.prototype.getListByChids = async function (chids, limit, skip = 0, sort = 'DESC') {

}

ChannelInfoRepository.prototype.appendRecipientAndReturn = async function (chid, uid) {
}

ChannelInfoRepository.prototype.removeRecipientAndReturn = async function (chid, uid) {
}

ChannelInfoRepository.prototype.appendMemberAndReturn = async function (chid, uid) {

}

ChannelInfoRepository.prototype.removeMemberAndReturn = async function (chid, uid) {

}

ChannelInfoRepository.prototype.removeByChid = async function (chid) {

}

ChannelInfoRepository.prototype.updateLatestSpoke = async function (chid, latestSpoke) {

}

module.exports = new ChannelInfoRepository()
