/* eslint-disable no-empty-label */
'use strict';

// eslint-disable-next-line no-var
var exports = module.exports = {};
const buildLog = [];
let obj = {};
let emit, largeMsg, message;

exports.addLog = function(type, smallMessage, socket, largeMessage) {
  if (typeof largeMessage === 'undefined') {
    largeMsg = smallMessage;
  }

  buildLog.push({'type': type, 'smallMessage': smallMessage, 'largeMessage': largeMsg});
  message = largeMsg.toString();
  obj = {'type': type, 'smallMessage': smallMessage, 'largeMessage': message};
  emit = false;

  if (socket.constructor.name === 'Socket') {
    emit = true;
  }
  if (emit) {
    socket.emit('buildLog', obj);
  }
};
