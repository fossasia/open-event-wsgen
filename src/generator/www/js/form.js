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
  $('#btnLive').click(function () {
    var formData = getData();
    socket.emit('live', formData);
  });

  socket.on('live.ready', function (data) {
    console.log('live render ready');
    window.location.href = data.appDir;
  })
  socket.on('live.process', function (data) {
    $('#status').animate({'opacity': 0}, 500, function () {
      $(this).text(data.status);
    }).animate({'opacity': 1}, 500);
  })
  
});

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
  data.singlefileUpload = $('#singlefileUpload')[0].files[0];
  data.zipLength = $('#singlefileUpload')[0].files[0].size;
  console.log(data);

  return data;
}


