$(document).ready( function() {

  $('#btn').click( function() {
    var form = new FormData($('form').get(0));

    // form.append('email', $('#email').val());
    // form.append('name', $('#name').val());
    // form.append('url', $('#url').val());
    // form.append('theme', $('#theme').val());
    // form.append('speakerfile', {'0': {}});
    // form.append('sessionfile', {'0': {}});
    // form.append('eventfile', {'0': {}});
    // form.append('sponsorfile', {'0': {}});
    // form.append('trackfile', {'0': {}});
    // form.append('locationfile', {'0': {}});

    var settings = {
      'async': true,
      'crossDomain': true,
      'url': '/generate',
      'method': 'POST',
      'headers': {
        'cache-control': 'no-cache'
      },
      'processData': false,
      'contentType': false,
      'mimeType': 'multipart/form-data',
      success: function(resp, status, jsonp) {
        console.log(status);
        console.log(resp);
      },
      'data': form
    };

    $.ajax(settings);
  });
});
