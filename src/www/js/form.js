"use strict";
var generateProgressBar, generateProgressVal, uploadProgressBar, uploadProgressVal;
var statusText;
var uploadFinished = false;

$(document).ready(function () {
  var socket = io();
  var uploader = new SocketIOFileUpload(socket);
  uploader.resetFileInputs = false;
  uploader.listenOnInput(document.getElementById('siofu_input'));

  uploader.addEventListener('start', function(event) {
    $('#siofu_input').hide()
    $('#upload-info').show();
    // $('#upload-progress-bar').show();
    $('#upload-filename').html(event.file.name.substring(0,14))
    var size = (event.file.size/(1024*1024)).toString().substring(0,3)
    $('#upload-filesize').html( size + "M") 
  });

  $('#cancelUpload').click(function(e){
    //TODO cancel soket ongoing uploading of file
    e.preventDefault();
    $('#siofu_input').val('').show()
    $('#upload-info').hide();
    $('#buildLog').empty();
    socket.emit('Cancel', 'Terminate the zip upload');
    updateGenerateProgress(0);
  })

  // uploader.addEventListener('progress', function(event) {
  //   var percentage = (event.bytesLoaded / event.file.size * 100);
  //   updateUploadProgress(percentage);
  //   if (percentage == 100) {
  //     uploadFinished = true;
  //     enableGenerateButton(true);
  //   }
  // });

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
    var ext = this.value.match(/\.([^\.]+)$/)[1];
    switch (ext) {
      case 'zip':
      break;
      default:
      alert('Only zip files are allowed');
      this.value = '';
    }
    $('.upload-progress').show();
    $('#upload-progress-bar').show();
    var fileData = getFile();
    socket.emit('upload', fileData);
  });

  $('#btnGenerate').click(function () {

    var check = $('#form').valid();
    $('.error').focus();
    if (check) {
      var formData = getData();
      $('#buildLog').empty();
      socket.emit('live', formData);
    }
    $('.generator-progress').show();
    $('#generator-progress-bar').show();

  });

  $('#aLog').click(function(e) {
    $('#buildLog').toggle();
  });


  socket.on('live.ready', function (data) {
    updateStatusAnimate('live render ready');
    updateGenerateProgress(100);
    displayButtons(data.appDir, data.url);
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
    if (data.percentage === 100) {
      uploadFinished = true;
      enableGenerateButton(true);
    }
  });

  var errorno = 0; // stores the id of an error needed for its div element
  socket.on('buildLog', function(data) {
    // There are three category of Log statements 
    // Info statements give information about the task currently being performed by the webapp
    // Success statements give the information of a task being successfully compeleted
    // Error statements give information about a task failing to complete. These statements also contain a detailed error log which can be viewed
    // by clicking on the Know more Button.

    var spanElem = $('<span></span>');  // will contain the info about type of statement
    var spanMess = $('<span></span>');  // will contain the actual message
    var aElem = $('<button></button>'); // Button to view the detailed error log
    var divElem = $('<div></div>');     // Contain the detailed error log
    var paragraph = $('<p></p>');       // Contain the whole statement
    spanMess.css({'margin-left' : '5px'});
    aElem.css({'margin-left' : '5px'});
    aElem.attr({'data-toggle' : 'collapse', 'href' : '#error' + String(errorno)});
    divElem.attr({'id' : 'error' + String(errorno)  , 'class' : 'collapse'});
    divElem.css({'color' : 'red'});
    aElem.text('Know More');
    spanMess.text(data.smallMessage);
    spanElem.text(data.type.toUpperCase() + ":");
    paragraph.append(spanElem);
    paragraph.append(spanMess);

    if(data.type === 'Info')
      spanElem.css({'color' : 'blue'});

    else if(data.type === 'Success')
      spanElem.css({'color' : 'green'});

    else if(data.type === 'Error') {
      spanElem.css({'color' : 'red'});
      divElem.text(data.largeMessage);
      paragraph.append(aElem);
      paragraph.append(divElem);
      errorno += 1;
    }
    $('#buildLog').append(paragraph);
  });

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

function displayButtons (appPath, url) {
  var btnDownload = $('#btnDownload');
  var btnLive = $('#btnLive');
  btnDownload.css('display', 'block');
  btnLive.css('display', 'block');

  btnLive.unbind('click').click(function () {
      window.open('/live/preview/' + appPath, '_blank');
  });

  btnDownload.unbind('click').click(function () {
    if(url === null) {
      window.open('/download/' + appPath, '_blank');
    }
    else {
      window.open(url);
    }
  });
}

function updateStatusAnimate (statusMsg, speed) {
  speed = speed || 200;
  var lowerOpaque = (speed < 200) ? 0.8 : 0.2;
  statusText.animate({'opacity': lowerOpaque}, speed, function () {
      statusText.text(statusMsg);
  }).animate({'opacity': 1}, speed);
}

function updateStatus(statusMsg) {
  statusText.text(statusMsg);
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
  }
  else {
    $('#btnGenerate').attr('title', 'Select a zip to upload first')
  }
}


function getFile () {
  var data = {};
  try {
    data.singlefileUpload = $('#singlefileUpload')[0].files[0];
    data.zipLength = $('#singlefileUpload')[0].files[0].size;
  }
  catch (err) {
    data.singlefileUpload = "";
    data.zipLength = 0;
  }
  return data;
}

function getData () {
  var data = {};
  var formData = $('#form').serializeArray();
  formData.forEach( function(field) {
    if (field.name === 'email') {data.email = field.value; }
    if (field.name === 'theme') {data.theme = field.value; }
    if (field.name === 'datasource') {data.datasource = field.value; }
    if (field.name === 'apiendpoint') {data.apiendpoint = field.value; }
    if (field.name === 'assetmode') {data.assetmode = field.value; }
  });
  if ($('#upload-ftp').prop('checked')) {
    data.ftpdetails = {
      host: $('#ftp-host').val(),
      user: $('#ftp-user').val(),
      pass: $('#ftp-pass').val(),
      path: $('#ftp-path').val()
    };
  }
  return data;
}
