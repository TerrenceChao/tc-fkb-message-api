function ChannelInfoRepository () {}

ChannelInfoRepository.prototype.create = async function (uid, channelName) {

}

ChannelInfoRepository.prototype.findOne = async function (query) {

}

ChannelInfoRepository.prototype.getListByCiids = async function (ciids, limit, skip = 0, sort = 'DESC') {

}

ChannelInfoRepository.prototype.appendInviteeAndReturn = async function (chid, uid) {
}

ChannelInfoRepository.prototype.removeInviteeAndReturn = async function (chid, uid) {
}

ChannelInfoRepository.prototype.appendMemberAndReturn = async function (chid, uid) {

}

ChannelInfoRepository.prototype.removeMemberAndReturn = async function (chid, uid) {

}

ChannelInfoRepository.prototype.removeByCiid = async function (ciid) {

}

ChannelInfoRepository.prototype.updateLatestSpoke = async function (ciid, latestSpoke) {

}

module.exports = new ChannelInfoRepository()
