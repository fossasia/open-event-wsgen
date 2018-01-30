$(document).ready(function() {
  // eventInfo is an object defined in the script section inside the session template file
  var eventName = eventInfo.name;
  var sideslider = $('[data-toggle=collapse-side]');
  var sel = sideslider.attr('data-target');
  var top = $('header[role=banner]').outerHeight();
  var downButton = $('#down-button');
  var sessionElem = $('.single-session');
  var sessionId = sessionElem.attr('id');

  function init() {
    var temp;

    if (localStorage.hasOwnProperty(eventName) === false) {
      localStorage[eventName] = '{}';
    }

    temp = JSON.parse(localStorage[eventName]);

    if (temp[sessionId] === 1) {
      sessionElem.find('.bookmark').css('color', 'black');
    }
  }

  sideslider.click(function() {
    $(sel).css('top', top);
    $(sel).toggleClass('in');
  });

  downButton.hide();
  downButton.click(function() {
    $('html, body').animate({scrollTop: 0}, 500);
    downButton.fadeOut(500);
  });

  window.addEventListener('scroll', function() {
    if ($(window).scrollTop() > 0) {
      downButton.fadeIn(500);
    }
    if ($(window).scrollTop() === 0) {
      downButton.fadeOut(500);
    }
  });

  $('.bookmark').click(function() {
    var temp = JSON.parse(localStorage[eventName]);
    var curColor = $(this).css('color');

    if (curColor === 'rgb(0, 0, 0)') {
      $(this).css('color', '');
      temp[sessionId] = 0;
    } else {
      $(this).css('color', 'black');
      temp[sessionId] = 1;
    }

    localStorage[eventName] = JSON.stringify(temp);
  });

  $('.session-lin').click(function(e) {
    var val = $(this).parent().parent().find('.speakers-inputbox').val();

    $(this).parent().parent().find('div.social-buttons').toggle();
    $(this).parent().parent().find('.speakers-inputbox').val(window.location.href.split('#')[0] + '#' + val.split('#').pop());
    e.stopPropagation();
  });

  init();
});
