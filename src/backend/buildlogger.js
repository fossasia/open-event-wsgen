'use strict';
var exports = module.exports = {};
var buildLog = [];

exports.addLog = function(type, smallMessage, socket, largeMessage) {
    if (typeof(largeMessage) === 'undefined') {
        largeMessage = smallMessage;
    }

    buildLog.push({'type':type, 'smallMessage' : smallMessage, 'largeMessage': largeMessage});
    largeMessage = largeMessage.toString();
    var obj = {'type' : type, 'smallMessage' : smallMessage, 'largeMessage': largeMessage};
    socket.emit('buildLog', obj);
};
