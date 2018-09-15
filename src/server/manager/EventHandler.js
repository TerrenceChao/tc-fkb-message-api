
function EventHandler() {}

EventHandler.prototype.eventName = "eventName is undefined";

EventHandler.prototype.handle = function(requestInfo) {
    throw new Error(`[EventHandler]: You should implement 'handle'.`);
}

module.exports = EventHandler;

