'use strict';

$('.social-button').click(function() {
  var source = this.id.toString().split('-')[0];

  if (source === 'fb') {
    window.open('http://www.facebook.com/share.php?u=' + window.location, 'facebook', 'height=360, width=580');
  } else if (source === 'tw') {
    window.open('http://twitter.com/home?status=' + window.location, 'twitter', 'height=360, width=580');
  } else if (source === 'go') {
    window.open('https://plus.google.com/share?url=' + encodeURIComponent(window.location), 'google', 'height=360, width=580');
  }
});
