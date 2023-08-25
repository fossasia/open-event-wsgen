$(function() {

  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//,'') === this.pathname.replace(/^\//,'') && location.hostname === this.hostname) {
      var href = $(this).attr('href');
      var link = href.split('#')[1];
      var selector = "a[id='" + link + "']";
      var target = $(selector);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 500);
        return false;
      }
    }
  });

  $('#down-button').hide();
  $('#down-button').click(function() {
    $('html, body').animate({scrollTop: 0}, 500);
    $('#down-button').fadeOut(500);
  });
  
  originTop = 0;
  function pinRightBar(){
    var right_bar = this.document.getElementById('right-bar')
    if(right_bar){
      if(originTop == 0){
        originTop = right_bar.offsetTop
      }

      if( originTop - window.scrollY <= 5){
        right_bar.classList.add('sticky')
      } else {
        right_bar.classList.remove('sticky')
      }
    }
  }

  $(document).ready(function(){
    pinRightBar()
  })

  window.addEventListener('scroll', function() {
    pinRightBar()
    if($(window).scrollTop() > 0) {
      $('#down-button').fadeIn(500);
    }
    if($(window).scrollTop() === 0) {
      $('#down-button').fadeOut(500);
    }
  });
});
