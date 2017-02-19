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
  var emit = false;

  if (socket.constructor.name === 'Socket') {
    emit = true;
  }
  if (emit) {
    socket.emit('buildLog', obj);
  }
};
