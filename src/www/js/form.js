/* eslint-disable no-empty-label */
/* global $ */
'use strict';

let generateProgressBar, generateProgressVal, uploadProgressBar, uploadProgressVal, statusText, date, percent, customMenuButton, menuContent, fontAwesomeIcom, msg;
let uploadFinished = false;
let isCancelling = false;
let generationStarted = false;
let initialValue = 0;

function updateGenerateProgress(perc) {
  generateProgressBar.animate({'width': perc + '%'}, 200, 'linear', function() {
    generateProgressVal.html(parseInt(perc, 10) + '%');
  });
}

function updateUploadProgress(perc) {
  uploadProgressBar.css('width', perc + '%');
  uploadProgressVal.html(parseInt(perc, 10) + '%');
}

function createCookie(name, value, days) {
  let expires = '';

  if (days) {
    date = new Date();

    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

$(document).ready(function() {
// eslint-disable-next-line no-undef
  const socket = io();

  document.getElementById('email').focus();

  function uploadFile(file) {
    // eslint-disable-next-line no-undef
    const size = (file.size / (1024 * 1024)).toString().substring(0, 3);
    // eslint-disable-next-line no-undef
    const stream = ss.createStream();
    // eslint-disable-next-line no-undef
    const blobStream = ss.createBlobReadStream(file);
    let fileUploadSize = 0;

    $('#siofu_input').hide();
    $('#upload-info').show();
    $('#upload-filename').html(file.name);
    $('#upload-filesize').html(size + 'M');

    stream.on('end', function() {
      console.log('File upload has finished');
      $('#message').show();
      socket.emit('finished', 'File upload has finished');
    });

    blobStream.on('data', function(chunk) {
      fileUploadSize += chunk.length;
      percent = fileUploadSize / file.size * 100;

      socket.emit('progress', percent);

      if (isCancelling) {
        msg = 'File upload was cancelled by user';

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

    // eslint-disable-next-line no-undef
    ss(socket).emit('file', stream, {size: file.size, name: file.name});
    blobStream.pipe(stream);
  }

  $('#siofu_input').change(function(e) {
    const file = e.target.files[0];
    const extension = file.name.substring(file.name.lastIndexOf('.') + 1);

    statusText.text('');
    isCancelling = false;

    if (extension === 'zip') {
      uploadFile(file);
    } else {
      $('#siofu_input').val('');
      statusText.css({'color': 'red'});
      statusText.text('Upload zip extension');
    }
  });

  customMenuButton = $('.custom-menubutton');
  menuContent = $('.custom-menu-cont');
  fontAwesomeIcom = $('.glyphicon-th');

  customMenuButton.click(function() {
    menuContent.toggleClass('hidden');
    $(this).toggleClass('custom-menubutton-color');
  });

  $('.custom-menu-item').click(function() {
    menuContent.addClass('hidden');
    customMenuButton.removeClass('custom-menubutton-color');
  });

  $(document).mouseup(function(e) {
    // if the target of the click is not the button,
    // the container, or descendants of the container
    if (!$(e.target).is(customMenuButton) && !$(e.target).is(menuContent) && menuContent.has(e.target).length === 0 && !$(e.target).is(fontAwesomeIcom)) {
      menuContent.addClass('hidden');
      customMenuButton.removeClass('custom-menubutton-color');
    }
  });

  $('#cancelUpload').click(function(e) {
    e.preventDefault();
    statusText.text('');

    isCancelling = true;
    generationStarted = false;

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

  $('#single').mouseover(
    function() {
      $(this).css('cursor', 'pointer');
    }).mousedown(
    function() {
      $(this).find('input').prop('checked', true);
    });

  $('#expandable').mouseover(
    function() {
      $(this).css('cursor', 'pointer');
    }).mousedown(
    function() {
      $(this).find('input').prop('checked', true);
    });

  $('#uploadJSON').mouseover(
    function() {
      $(this).css('cursor', 'pointer');
    }).mousedown(
    function() {
      if (!generationStarted) {
        $(this).find('input').prop('checked', true);
        if ($(this).find('input').is(':checked')) {
          if ($(this).find('input').val() === 'mockjson') {
            $('#jsonupload-input').hide(100);
            $('#eventapi-input').hide(100);
          }

          if ($(this).find('input').val() === 'jsonupload') {
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
        }
      }

      if ($(this).find('input').val() === 'jsonupload') {
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
    });

  $('#endpointAPI').mouseover(
    function() {
      $(this).css('cursor', 'pointer');
    }).mousedown(
    function() {
      if (!generationStarted) {
        $(this).find('input').prop('checked', true);
        if ($(this).find('input').is(':checked')) {
          if ($(this).find('input').val() === 'mockjson') {
            $('#jsonupload-input').hide(100);
            $('#eventapi-input').hide(100);
          }

          if ($(this).find('input').val() === 'eventapi') {
            $('#eventapi-input').show(100);
            $('#jsonupload-input').hide(100);
            $('#btnLive').hide();
            $('#btnDownload').hide();
            $('#deploy').hide();
            enableGenerateButton(true);
          }
        }
      }

      if ($(this).find('input').val() === 'eventapi') {
        $('#eventapi-input').show(100);
        $('#jsonupload-input').hide(100);
        $('#btnLive').hide();
        $('#btnDownload').hide();
        $('#deploy').hide();
        enableGenerateButton(true);
      }
    });

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
    function() {
      if ($(this).is(':checked')) {
        $('#upload-ftp-details').show(100);
      } else {
        $('#upload-ftp-details').hide(100);
      }
    }
  );

  $('#enable-google-analytics').change(
    function() {
      if ($(this).is(':checked')) {
        $('#ganalytics-id-container').show(100);
      } else {
        $('#ganalytics-id-container').hide(100);
      }
    }
  );

  $('#enable-google-calendar').change(
    function() {
      if ($(this).is(':checked')) {
        $('#gcalendar-id-container').show(100);
      } else {
        $('#gcalendar-id-container').hide(100);
      }
    }
  );

  $('#singlefileUpload').change(function() {
    const ext = this.value.match(/\.([^\.]+)$/)[1];

    switch (ext) {
      case 'zip':
        break;
      default:
        // eslint-disable-next-line no-alert
        alert('Only zip files are allowed');
        this.value = '';
    }
    $('.upload-progress').show();
    $('#upload-progress-bar').show();
    const fileData = getFile();

    socket.emit('upload', fileData);
  });

  $('#btnGenerate').click(function() {
    const check = $('#form').valid();

    $('.error').focus();
    if (check) {
      const formData = getData({uploadsId: initialValue});

      generationStarted = true;
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

  socket.on('uploadsId', function(data) {
    initialValue = data;
  });

  socket.on('waiting', function() {
    updateStatusAnimate('Request status: Waiting');
  });

  socket.on('live.ready', function(data) {
    updateStatusAnimate('live render ready');
    updateGenerateProgress(100);
    displayButtons(data.appDir, data.url);
    createCookie('folder', data.appDir);
    $('#btnGenerate').prop('disabled', true);
    $('#btnGenerate').attr('title', 'Generated webapp');
    $('#btnGenerate').prop('disabled', false);
    $('input[ type = "radio" ]').attr('disabled', false);
    $('#email').prop('disabled', false);
    addDeployLink();
  });

  socket.on('live.process', function(data) {
    if (!isCancelling) {
      console.log(data.status);
      statusText.text(data.status);
      updateGenerateProgress(data.donePercent);
    }
  });

  socket.on('live.error', function(err) {
    statusText.css('color', 'red');
    updateStatusAnimate(err.status);
  });

  function deployStatus() {
    const apiUrl = 'https://api.github.com/repos/fossasia/open-event-webapp/git/refs/heads/development';

    $.ajax({url: apiUrl, success: function(result) {
      const version = result.object.sha;
      const versionLink = 'https://github.com/fossasia/open-event-webapp/tree/' + version;
      const deployLink = $('#deploy-link');

      deployLink.attr('href', versionLink);
      deployLink.html(version);
    }});
  }

  deployStatus();

  let errorno = 0; // stores the id of an error needed for its div element

  socket.on('buildLog', function(data) {
    // There are three category of Log statements
    // Info statements give information about the task currently being performed by the webapp
    // Success statements give the information of a task being successfully compeleted
    // Error statements give information about a task failing to complete. These statements also contain a detailed error log which can be viewed
    // by clicking on the Know more Button.

    const spanElem = $('<span></span>'); // will contain the info about type of statement
    const spanMess = $('<span></span>'); // will contain the actual message
    const aElem = $('<button></button>'); // Button to view the detailed error log
    const divElem = $('<div></div>'); // Contain the detailed error log
    const paragraph = $('<p></p>'); // Contain the whole statement

    spanMess.css({'margin-left': '5px'});
    aElem.css({'margin-left': '5px'});
    aElem.attr({'data-toggle': 'collapse', 'href': '#error' + String(errorno)});
    divElem.attr({'id': 'error' + String(errorno), 'class': 'collapse'});
    divElem.css({'color': 'red'});
    aElem.text('Know More');
    spanMess.text(data.smallMessage);
    spanElem.text(data.type.toUpperCase() + ':');
    paragraph.append(spanElem);
    paragraph.append(spanMess);

    if (data.type === 'Info') {
      spanElem.css({'color': 'blue'});
    } else if (data.type === 'Success') {
      spanElem.css({'color': 'green'});
    } else if (data.type === 'Error') {
      spanElem.css({'color': 'red'});
      divElem.text(data.largeMessage);
      paragraph.append(aElem);
      paragraph.append(divElem);
      errorno += 1;
      generationStarted = false;
      updateGenerateProgress(0);
      updateStatusAnimate(data.smallMessage, 200, 'red');
      $('#btnGenerate').prop('disabled', false);
      $('input[ type = "radio" ]').attr('disabled', false);
      $('#email').prop('disabled', false);
    }
    $('#buildLog').append(paragraph);
    $('#buildLog').scrollTop($('#buildLog')[0].scrollHeight);
  });
});

function displayButtons(appPath, url) {
  const btnDownload = $('#btnDownload');
  const btnLive = $('#btnLive');
  const deploy = $('#deploy');

  deploy.show();
  btnDownload.css('display', 'block');
  btnLive.css('display', 'block');

  btnLive.unbind('click').click(function() {
    window.open('/live/preview/' + appPath, '_blank');
  });

  btnDownload.unbind('click').click(function() {
    if (url === null) {
      window.open('/download/' + appPath, '_blank');
    } else {
      window.open(url);
    }
  });
}

function updateStatusAnimate(statusMsg, speed, color) {
  const statusColor = color || 'black';
  const statusSpeed = speed || 200;
  const lowerOpaque = statusSpeed < 200 ? 0.8 : 0.2;

  statusText.animate({'opacity': lowerOpaque}, statusSpeed, function() {
    statusText.css({'color': statusColor});
    statusText.text(statusMsg);
  }).animate({'opacity': 1}, statusSpeed);
}

function updateStatus(statusMsg) {
  statusText.text(statusMsg);
}

function initialState() {
  $('input:radio[name="datasource"]').prop('checked', false);
  $('#upload-ftp').prop('checked', false);
  $('#enable-google-analytics').prop('checked', false);
  $('#enable-google-calendar').prop('checked', false);
  $('#btnGenerate').prop('disabled', true);
  uploadFinished = false;
}

function enableGenerateButton(enabled) {
  $('#btnGenerate').prop('disabled', !enabled);
  if (enabled) {
    $('#btnGenerate').attr('title', 'Generate webapp');
  } else {
    $('#btnGenerate').attr('title', 'Select a zip to upload first');
  }
}

function getFile() {
  const data = {};

  try {
    data.singlefileUpload = $('#singlefileUpload')[0].files[0];
    data.zipLength = $('#singlefileUpload')[0].files[0].size;
  } catch (err) {
    data.singlefileUpload = '';
    data.zipLength = 0;
  }
  return data;
}

function getData(initValue) {
  const data = initValue;
  const formData = $('#form').serializeArray();

  formData.forEach(function(field) {
    if (field.name === 'email') {
      data.email = field.value;
    }
    if (field.name === 'theme') {
      data.theme = field.value;
    }
    if (field.name === 'datasource') {
      data.datasource = field.value;
    }
    if (field.name === 'apiendpoint') {
      data.apiendpoint = field.value;
    }
    if (field.name === 'assetmode') {
      data.assetmode = field.value;
    }
    if (field.name === 'session') {
      data.sessionMode = field.value;
    }
    if (field.name === 'apiVersion') {
      data.apiVersion = field.value;
    }
  });
  if ($('#upload-ftp').prop('checked')) {
    data.ftpdetails = {
      host: $('#ftp-host').val(),
      port: $('#ftp-port').val(),
      user: $('#ftp-user').val(),
      pass: $('#ftp-pass').val(),
      path: $('#ftp-path').val()
    };
  }
  if ($('#enable-google-analytics').prop('checked')) {
    data.ganalyticsID = {
      id: $('#ganalytics-id').val()
    };
  }
  if ($('#enable-google-calendar').prop('checked')) {
    data.gcalendar = {
      id: $('#gcalendar-id').val(),
      key: $('#gcalendar-key').val()
    };
  }

  return data;
}

