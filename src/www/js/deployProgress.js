var socket = io.connect('https://opev-webgen-dev.herokuapp.com/deploy');
var $deploy = $('#deploy');
var $abort = $('#abort');
var $msg = $('#msg');
var $link = $('#link');
var $error = $('#error');
var $progressBar = $('#upload-progress-bar');
var $progressVal = $('#upload-progress-val');
var $progressDiv = $('.progress');

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
  var errorMsg = $("<p class='errorMsg' style='color:red'>" + msg + '</p>');
  $error.append(errorMsg);
}

$deploy.click(function() {
  socket.emit('start', 'Kick Starting the deployment process');
  resetContents();
  showInfo();
  $deploy.hide();
  $abort.show();
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
  var link = $('<a> Here is your deployed Event site. Thanks for using web app generator </a>');
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
  var fileName = msg.file;
  var percent = msg.percent;
  addInfoMessage(fileName + " uploaded");
  setProgressValues(parseInt(percent));
});

socket.on('abort', function(msg) {
  console.log(msg);
  $deploy.show();
  $error.html("");
  addErrorMessage(msg);
});
