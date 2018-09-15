
function RequestInfo() {
    this.req;
    this.res;
    this.socket;
    this.packetContent = {};

    this.clientPacketContent = null;
}

RequestInfo.prototype.clientPacket = function(sender, TO, receiver, responseEvent, clientPacket) {
    if ( ! this.clientPacketContent) {
        this.clientPacketContent = {
            header: {},
            body: {}
        };
    }
    
    let client = this.clientPacketContent;
    // header
    client.header.sender     = sender || client.header.sender;
    client.header.to         = to || client.header.to;
    client.header.receiver   = receiver || client.header.receiver;
    client.header.responseEvent  = responseEvent || client.header.responseEvent;

    // body
    client.body   = clientPacket || client.body;
}

RequestInfo.prototype.channelParam = function(uid, type, channelKey) {
    if ( ! this.clientPacketContent) {
        this.clientPacketContent = {
            header: {},
            body: {}
        };
    }   

    let clientHeader = this.clientPacketContent.header;
    clientHeader.uid = uid;
    clientHeader.type = type;
    clientHeader.channelKey = channelKey;
}

module.exports = RequestInfo;