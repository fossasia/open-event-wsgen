$(document).ready(function () {
  $('input:radio[name="datasource"]').change(
      function() {
          var jsonuploadInput = $('#jsonupload-input');
          var eventapiInput = $('#eventapi-input');
          
          if ($(this).is(':checked')) {

            if ($(this).val() === 'mockjson') {
              jsonuploadInput.hide(100);
              eventapiInput.hide(100);
            }

            if ($(this).val() === 'jsonupload') {
              jsonuploadInput.show(100);
              eventapiInput.hide(100);
            }

            if ($(this).val() === 'eventapi') {
              eventapiInput.show(100);
              jsonuploadInput.hide(100);
            }
          }
      });
});
