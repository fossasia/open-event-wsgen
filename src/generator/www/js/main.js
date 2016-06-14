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

    $.ajax({
      url : '/generate',
      type: 'POST',
      method: 'POST',
      data: form,
      mimeType: 'multipart/form-data',
      success: function(data, textStatus, jqXHR) {
        console.log(data.status);
      },
      error: function (jqXHR, textStatus, errorThrown) {

      }
    });

  });
});
