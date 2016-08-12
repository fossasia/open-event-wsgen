"use strict";

$(document).ready(function () {
  var socket = io();
  

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
  $('#btnGenerate').click(function () {
     
     var check = $("#form").valid();
     $(".error").focus();
     if (check) {
       var formData = getData();
       socket.emit('live', formData);
     }
    
    $('#generator-progress').css('display', 'block')
    
  });

  socket.on('live.ready', function (data) {
    updateStatus('live render ready');
    displayButtons(data.appDir);
    updatePercent(100);
  });
  socket.on('live.process', function (data) {
    updateStatus(data.status);
    updatePercent(data.donePercent);
  });
  socket.on('live.error' , function (err) {
     $('#status').css('color' , 'red');
      updateStatus(err.status);

  });
  
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
  try {
    data.singlefileUpload = $('#singlefileUpload')[0].files[0];
    data.zipLength = $('#singlefileUpload')[0].files[0].size;
  } catch (err) {
    data.singlefileUpload = "";
    data.zipLength = 0;
  }
  
  return data;
}


