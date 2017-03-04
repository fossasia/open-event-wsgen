'use strict';

$(document).ready(function() {
  $('.social-button').click(function() {
    var link = $(this).parent().parent().find('input.speakers-inputbox').val();
    var source = $(this).attr('class').split(' ')[0].split('-')[0];

    if (source === 'fb') {
      window.open('http://www.facebook.com/share.php?u=' + encodeURIComponent(link), 'facebook', 'height=360, width=580');
    } else if (source === 'tw') {
      window.open('http://twitter.com/home?status=' + encodeURIComponent(link), 'twitter', 'height=360, width=580');
    } else if (source === 'go') {
      window.open('https://plus.google.com/share?url=' + encodeURIComponent(link), 'google', 'height=360, width=580');
    } else if (source === 'li') {
      window.open('http://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(link), 'linkedin', 'height=360, width=580');
    }
  });
});
