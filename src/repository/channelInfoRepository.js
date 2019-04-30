
function ChannelInfoRepository () {}

ChannelInfoRepository.prototype.create = async function (uid, channel_name) {

}

ChannelInfoRepository.prototype.find = async function (query) {

}

ChannelInfoRepository.prototype.getListByIds = async function (ciids, limit, skip, sort = 'DESC') {

}

ChannelInfoRepository.prototype.appendMemberAndReturn = async function (chid, uid) {

}

ChannelInfoRepository.prototype.removeMemberAndReturn = async function (chid, uid) {

}

ChannelInfoRepository.prototype.removeById = async function (ciid) {

}

ChannelInfoRepository.prototype.updateLatestSpoke = async function (ciid, latestSpoke) {

}

module.exports = new ChannelInfoRepository()
