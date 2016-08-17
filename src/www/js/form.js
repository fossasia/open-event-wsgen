"use strict";

$(document).ready(function () {
  var socket = io();

  $('input:radio[name="datasource"]').prop('checked', false);
  $('#upload-ftp').prop('checked', false);
  

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
            }

            if ($(this).val() === 'eventapi') {
              $('#eventapi-input').show(100);
              $('#jsonupload-input').hide(100);
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
    $('.progress').css('display','block');
    $('#generator-progress').css('display', 'block')
    
  });

  socket.on('live.ready', function (data) {
    updateStatus('live render ready');
    updatePercent(100);
    displayButtons(data.appDir);
  });
  socket.on('live.process', function (data) {
    updateStatus(data.status);
    updatePercent(data.donePercent);
  });
  socket.on('live.error' , function (err) {
     $('#status').css('color' , 'red');
      updateStatus(err.status);

  });
  socket.on('upload.progress', function(data) {
    console.log(data)
  })
  
});

function updatePercent(perc) {
  $('#generator-progress').animate({'width': perc + '%'}, function () {
    $('#generator-progress-val').html(perc + '%');
  });
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

function updateStatus (statusMsg) {
  $('#status').animate({'opacity': 0}, function () {
    $(this).text(statusMsg);
  }).animate({'opacity': 1});
}

function getFile () {
  var data = {};
  var formData = $('#form').serializeArray();
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
  try {
    data.singlefileUpload = $('#singlefileUpload')[0].files[0];
    data.zipLength = $('#singlefileUpload')[0].files[0].size;
  } catch (err) {
    data.singlefileUpload = "";
    data.zipLength = 0;
  }
  
  return data;
}


