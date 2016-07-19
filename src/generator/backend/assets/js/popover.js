/* Created by aayusharora on June 20, 2017 */

$(document).ready(function() {
  var popbox = $('.pop-box');
  popbox.hide();
  if($(window).width() < 768) {
    $('.sizeevent').click(function(event) {
      popBox(event);
    });
  }
  else {
    $('.sizeevent').hover(function(event) {
      popBox(event);
    });
  }  
  function popBox(e) {
    event = e || window.event;

    popbox.hide();
    event.preventDefault();
    event.stopPropagation();
    
   var track = $(event.target);
  var tracknext= $(track).next();
    tracknext.show();
  var tracktocheck= track.offset().top + track.outerHeight() + tracknext.outerHeight() + 15;
  var shift= tracktocheck - ($('.main').offset().top + $('.main').outerHeight());
  console.log($('.main').offset().top + $('.main').outerHeight())
//console.log("tracknext.offset().top ", tracknext.offset().top );
//console.log("track.outerHeight()", track.outerHeight());
//console.log("tracknext.outerHeight()", tracknext.outerHeight());
//console.log("tracktocheck", tracktocheck);
//console.log("$('.footer').offset().top ", $('.footer').offset().top );
  if(shift>0){
   
    $('.footer').css({
      'position':'absolute',
      'top': $('.main').offset().top + $('.main').outerHeight() + shift,
      'width':'100%',
      'z-index': '999'
    })
  }
  else {
    $('.footer').css({
      'position':'static'
    })
  }
 
  //console.log($('.footer').offset().top  );
 $(document).mouseup(function(e) {
      var container = popbox;
      
      if (!container.is(e.target)
            && container.has(e.target).length === 0 && (e.target) !== $('html').get(0))
          {
        container.hide();
    
      }
    });
  }
   
});
