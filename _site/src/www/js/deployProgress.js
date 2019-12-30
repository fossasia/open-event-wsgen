/* eslint-disable no-empty-label */
'use strict';
// eslint-disable-next-line no-undef
const socket = io.connect('https://opev-webgen-dev.herokuapp.com/deploy');
const $deploy = $('#deploy');
const $abort = $('#abort');
const $msg = $('#msg');
const $link = $('#link');
const $error = $('#error');
const $progressBar = $('#upload-progress-bar');
const $progressVal = $('#upload-progress-val');
const $progressDiv = $('.progress');
const $title = $('#title');

function resetContents() {
  $error.html('');
  $link.html('');
  $msg.html('');
  setProgressValues(0);
}

function showInfo() {
  $msg.show();
  $link.show();
}

function hideInfo() {
  $msg.hide();
  $link.hide();
  $progressDiv.hide();
}

function setProgressValues(percent) {
  $progressBar.css('width', percent + '%');
  $progressVal.html(percent + '%');
}

function addInfoMessage(msg) {
  $msg.html(msg);
}

function addErrorMessage(msg) {
  const errorMsg = $("<p class='errorMsg' style='color:red'>" + msg + '</p>');

  $error.append(errorMsg);
}

$deploy.click(function() {
  socket.emit('start', 'Kick Starting the deployment process');
  resetContents();
  showInfo();
  $deploy.hide();
  $abort.show();
  $title.html('Press the button below to abort the deployment process');
});

$abort.click(function() {
  socket.emit('stop', 'Stop the deployment process');
  $abort.hide();
  $error.html('');
  hideInfo();
  addErrorMessage('The process is being aborted');
});

socket.on('progress', function(msg) {
  addInfoMessage(msg);
});

socket.on('finished', function(msg) {
  const link = $('<a> Here is your deployed Event site. Thanks for using web app generator </a>');

  link.attr('href', msg);
  $link.append(link);
  setProgressValues(100);
  $abort.hide();
});

socket.on('errorLog', function(msg) {
  console.log(msg);
  addErrorMessage(msg);
});

socket.on('select', function(msg) {
  addInfoMessage(msg);
});

socket.on('started', function(msg) {
  addInfoMessage(msg);
  $progressDiv.show();
});

socket.on('fileUpload', function(msg) {
  const fileName = msg.file;
  const percent = msg.percent;

  addInfoMessage(fileName + ' uploaded');
  setProgressValues(parseInt(percent, 10));
});

socket.on('abort', function(msg) {
  console.log(msg);
  $deploy.show();
  $error.html('');
  addErrorMessage(msg);
  $title.html('Press the button below to re-start the deployment process');
});
