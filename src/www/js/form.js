"use strict";
var generateProgressBar, generateProgressVal, uploadProgressBar, uploadProgressVal;
var statusText;
var uploadFinished = false;

$(document).ready(function () {
  var socket = io();

  initialState();
  generateProgressBar = $('#generator-progress-bar');
  generateProgressVal = $('#generator-progress-val');
  uploadProgressBar = $('#upload-progress-bar');
  uploadProgressVal = $('#upload-progress-val');
  statusText = $('#status');


  $('input:radio[name="datasource"]').change(
      function() {
          if ($(this).is(':checked')) {

            if ($(this).val() === 'mockjson') {
              $('#jsonupload-input').hide(100);
              $('#eventapi-input').hide(100);
            }

            if ($(this).val() === 'jsonupload') {
              $('#jsonupload-input').show(100);
              $('#eventapi-input').hide(100);
              if (uploadFinished) {
                enableGenerateButton(true);
              } else {
                enableGenerateButton(false);
              }
            }

            if ($(this).val() === 'eventapi') {
              $('#eventapi-input').show(100);
              $('#jsonupload-input').hide(100);
              enableGenerateButton(true);
            }
          }
      });
  $('#upload-ftp').change(
    function () {
      if ($(this).is(':checked')) {
        $('#upload-ftp-details').show(100);
      } else {
        $('#upload-ftp-details').hide(100);
      }
    }
  );
  $('#singlefileUpload').change(function () {
    $('.upload-progress').show();
    $('#upload-progress-bar').show();
    var fileData = getFile();
    socket.emit('upload', fileData);
  });
  $('#btnGenerate').click(function () {
     
     var check = $("#form").valid();
     $(".error").focus();
     if (check) {
       var formData = getData();
       socket.emit('live', formData);
     }
    $('.generator-progress').show();
    $('#generator-progress-bar').show();
    
  });

  socket.on('live.ready', function (data) {
    updateStatusAnimate('live render ready');
    updateGenerateProgress(100);
    displayButtons(data.appDir);
  });
  socket.on('live.process', function (data) {
    updateStatusAnimate(data.status);
    updateGenerateProgress(data.donePercent);
  });
  socket.on('live.error' , function (err) {
     statusText.css('color' , 'red');
      updateStatusAnimate(err.status);

  });
  socket.on('upload.progress', function(data) {
    updateUploadProgress(data.percentage);
    updateStatus('ETA : ' + data.eta + 's' + '  Speed: ' + (data.speed/1000) + 'KBps');
    if (data.percentage == 100) {
      updateStatus('Zip uploaded');
      uploadFinished = true;
      enableGenerateButton(true);
    }
  })
  
});

function updateGenerateProgress(perc) {
  generateProgressBar.animate({'width': perc + '%'}, 200, 'linear', function () {
    generateProgressVal.html(parseInt(perc) + '%');
  });
}
function updateUploadProgress(perc) {
  uploadProgressBar.css('width', perc + '%');
  uploadProgressVal.html(parseInt(perc) + '%');
}

function displayButtons (appPath) {
  var btnDownload = $('#btnDownload');
  var btnLive = $('#btnLive');
  btnDownload.css('display', 'block');
  btnLive.css('display', 'block');

  btnLive.unbind('click').click(function () {
    window.open('/live/preview/' + appPath, '_blank')
  });

  btnDownload.unbind('click').click(function () {
    window.open('/download/' + appPath, '_blank')
  })
}

function updateStatusAnimate (statusMsg, speed) {
  speed = speed || 200;
  var lowerOpaque = (speed < 200) ? 0.8 : 0.2;
  statusText.animate({'opacity': lowerOpaque}, speed, function () {
    statusText.text(statusMsg);
  }).animate({'opacity': 1}, speed);
}
function updateStatus(statusMsg) {
  statusText.text(statusMsg)
}

function initialState() {
  $('input:radio[name="datasource"]').prop('checked', false);
  $('#upload-ftp').prop('checked', false);
  $('#btnGenerate').prop('disabled', true);
  uploadFinished = false;
}

function enableGenerateButton(enabled) {
  $('#btnGenerate').prop('disabled', !enabled);
  if (enabled) {
    $('#btnGenerate').attr('title', 'Generate webapp')
  } else {
    $('#btnGenerate').attr('title', 'Select a zip to upload first')
  }
}


function getFile () {
  var data = {};
  try {
    data.singlefileUpload = $('#singlefileUpload')[0].files[0];
    data.zipLength = $('#singlefileUpload')[0].files[0].size;
  } catch (err) {
    data.singlefileUpload = "";
    data.zipLength = 0;
  }
  return data;
}

function getData () {
  var data = {};
  var formData = $('#form').serializeArray();
  formData.forEach( function(field) {
    if (field.name == 'name') {data.name = field.value }
    if (field.name == 'email') {data.email = field.value }
    if (field.name == 'theme') {data.theme = field.value }
    if (field.name == 'datasource') {data.datasource = field.value }
    if (field.name == 'apiendpoint') {data.apiendpoint = field.value }
    if (field.name == 'assetmode') {data.assetmode = field.value }
  });
  if ($('#upload-ftp').prop('checked')) {
    data.ftpdetails = {
      host: $('#ftp-host').val(),
      user: $('#ftp-user').val(),
      pass: $('#ftp-pass').val(),
      path: $('#ftp-path').val()
    }
  }
  return data;
}


