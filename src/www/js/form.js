/* global $ */
"use strict";


var generateProgressBar, generateProgressVal, uploadProgressBar, uploadProgressVal, statusText;
var uploadFinished = false;

var isCancelling = false;
var menuDisplay = false;

function updateGenerateProgress(perc) {
  generateProgressBar.animate({'width': perc + '%'}, 200, 'linear', function () {
    generateProgressVal.html(parseInt(perc, 10) + '%');
  });
}

function updateUploadProgress(perc) {
  uploadProgressBar.css('width', perc + '%');
  uploadProgressVal.html(parseInt(perc, 10) + '%');
}

function createCookie(name, value, days) {
  var expires = '';
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

$(document).ready(function () {
  var socket = io();

  function uploadFile(file) {

    var size = (file.size/(1024*1024)).toString().substring(0, 3);
    var stream = ss.createStream();
    var blobStream = ss.createBlobReadStream(file);
    var fileUploadSize = 0;

    $('#siofu_input').hide();
    $('#upload-info').show();
    $('#upload-filename').html(file.name);
    $('#upload-filesize').html(size + 'M');

    stream.on('end', function(data) {
      console.log('File upload has finished');
      $('#message').show();
      socket.emit('finished', 'File upload has finished');
    });


    blobStream.on('data', function(chunk) {
      fileUploadSize += chunk.length;
      var percent = (fileUploadSize / file.size * 100) ;
      socket.emit('progress', percent);

      if(isCancelling) {
        var msg = 'File upload was cancelled by user';
        stream.destroy();
        socket.emit('cancelled', msg);
        isCancelling = false;
        console.log(msg);
      }

      updateUploadProgress(Math.floor(percent));

      if (percent === 100) {
        uploadFinished = true;
        enableGenerateButton(true);
      }
    });

    ss(socket).emit('file', stream, {size: file.size, name: file.name});
    blobStream.pipe(stream);

  }

  $('#siofu_input').change(function(e) {
    var file = e.target.files[0];
    var extension = file.name.substring(file.name.lastIndexOf('.') + 1);

    statusText.text('');
    isCancelling = false;

    if(extension === 'zip') {
      uploadFile(file);
    }

    else {
      $('#siofu_input').val('');
      statusText.css({'color' : 'red'});
      statusText.text('Upload zip extension');
    }

  });

  var customMenuButton = $('.custom-menubutton').first();

  customMenuButton.click(function() {
    var menuContent = $('.custom-menu-cont')[0];

    if (menuDisplay) {
      $(menuContent).removeClass('shown');
      $(menuContent).addClass('hidden');
    } else {
      $(menuContent).removeClass('hidden');
      $(menuContent).addClass('shown');
    }
    menuDisplay = !menuDisplay;
  });

  $('#cancelUpload').click(function(e){
    e.preventDefault();
    statusText.text('');

    isCancelling = true;

    $('#siofu_input').val('').show();
    $('#upload-info').hide();
    $('#message').hide();
    $('#buildLog').empty();

    // Disable the generateProgressBar and hide the status bar as well
    updateGenerateProgress(0);
    enableGenerateButton(false);

    $('.generator-progress').hide();
    $('#generator-progress-bar').hide();
    $('#btnGenerate').prop('disabled', true);
    $('#btnLive').hide();
    $('#btnDownload').hide();
    $('input[ type = "radio" ]').attr('disabled', false);
    $('#email').prop('disabled', false);
    $('#deploy').hide();
  });

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
          $('#btnLive').hide();
          $('#btnDownload').hide();
          $('#deploy').hide();
          if (uploadFinished) {
            enableGenerateButton(true);
          } else {
            enableGenerateButton(false);
          }
        }

        if ($(this).val() === 'eventapi') {
          $('#eventapi-input').show(100);
          $('#jsonupload-input').hide(100);
          $('#btnLive').hide();
          $('#btnDownload').hide();
          $('#deploy').hide();
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
      $('.generator-progress').show();
      $('#generator-progress-bar').show();
      $('#btnGenerate').prop('disabled', true);
      $('input[ type = "radio" ]').attr('disabled', true);
      $('#email').prop('disabled', true);
    }
  });

  $('#aLog').click(function(e) {
    $('#buildLog').toggle();
  });

  function addDeployLink() {
    $('#deploy').attr('href', '/auth');
  }

  socket.on('live.ready', function (data) {
    updateStatusAnimate('live render ready');
    updateGenerateProgress(100);
    displayButtons(data.appDir, data.url);
    createCookie('folder', data.appDir);
    $('#btnGenerate').prop('disabled', true);
    $('#btnGenerate').attr('title', 'Generated webapp')
    $('#btnGenerate').prop('disabled', false);
    addDeployLink();
  });

  socket.on('live.process', function (data) {
    if(!isCancelling){
      console.log(data.status);
      statusText.text(data.status);
      updateGenerateProgress(data.donePercent);
    }
  });

  socket.on('live.error' , function (err) {
    statusText.css('color', 'red');
    updateStatusAnimate(err.status);

  });

  function deployStatus() {
    var apiUrl = "https://api.github.com/repos/fossasia/open-event-webapp/git/refs/heads/development";
    $.ajax({url: apiUrl, success: function(result){
      var version = result['object']['sha'];
      var versionLink = 'https://github.com/fossasia/open-event-webapp/tree/' + version;
      var deployLink = $('#deploy-link');
      deployLink.attr('href', versionLink);
      deployLink.html(version);
    }});
  }

  deployStatus();

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
    spanElem.text(data.type.toUpperCase() + ':');
    paragraph.append(spanElem);
    paragraph.append(spanMess);

    if(data.type === 'Info') {
      spanElem.css({'color': 'blue'});
    } else if(data.type === 'Success') {
      spanElem.css({'color': 'green'});
    } else if(data.type === 'Error') {
      spanElem.css({'color': 'red'});
      divElem.text(data.largeMessage);
      paragraph.append(aElem);
      paragraph.append(divElem);
      errorno += 1;
      updateGenerateProgress(0);
      updateStatusAnimate(data.smallMessage, 200, 'red');
      $('#btnGenerate').prop('disabled', false);
      $('input[ type = "radio" ]').attr('disabled', false);
      $('#email').prop('disabled', false);
    }
    $('#buildLog').append(paragraph);
    $("#buildLog").scrollTop($("#buildLog")[0].scrollHeight);
  });

});

function displayButtons (appPath, url) {
  var btnDownload = $('#btnDownload');
  var btnLive = $('#btnLive');
  var deploy = $('#deploy');
  deploy.show();
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

function updateStatusAnimate (statusMsg, speed, color) {
  color = color || 'black';
  speed = speed || 200;
  var lowerOpaque = (speed < 200) ? 0.8 : 0.2;
  statusText.animate({'opacity': lowerOpaque}, speed, function () {
    statusText.css({'color' : color});
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
    $('#btnGenerate').attr('title', 'Generate webapp');
  }
  else {
    $('#btnGenerate').attr('title', 'Select a zip to upload first');
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
    if (field.name === 'session') {data.sessionMode = field.value;}
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
