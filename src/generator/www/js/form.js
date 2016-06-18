$(document).ready(function () {
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
});
