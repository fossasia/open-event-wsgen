/* Created by aayusharora on June 20, 2017 */

$(document).ready(function() {
  var widthWindow = $(window).width();
  var popbox = $('.pop-box');
  var headerpop = $('.header-pop');
  var outerContheight= $('.main').offset().top + $('.main').outerHeight()
  var sizeevent = $('.sizeevent');
  var tracktime = $('.sizeevent span'); 

  popbox.hide();
  if( widthWindow < 768) {
   sizeevent.click(function(event) {
      popBox(event);
    });
  }
  else {
    headerpop.hover(function(event) {
      popBox(event);
    },function(){
      popbox.hide();
      hidePopbox();
    });
  }  
  function popBox(e) {
    event = e || window.event;

    popbox.hide();
    event.preventDefault();
    event.stopPropagation();
    
    var sizecontainer = sizeevent;
    var timeOftrack = tracktime;
    var track;
    if(!sizecontainer.is(event.target)) {
      if(!timeOftrack.is(event.target)){
         track = $(event.target).children('h4');
      }
      else {
         track = $(event.target).parent();
      }
      
    }
    else {
       track = $(event.target);
    }

   var tracknext= $(track).next();
    tracknext.show();
   var tracktocheck= track.offset().top + track.outerHeight() + tracknext.outerHeight() + 15;
   var shift= tracktocheck - outerContheight;
   if(shift > 0){
   
    $('.footer').css({
      'position':'absolute',
      'top': outerContheight + shift,
      'width':'100%',
      'z-index': '999'
    })
  }
  else {
    hidePopbox();
  }

  }
  function hidePopbox() {
    $('.footer').css({
      'position':'static'
    })
  }
  if (widthWindow < 768) {
   $(document).mouseup(function(e) {
      var container = popbox;
      if (!container.is(e.target)
            && container.has(e.target).length === 0)
          {
        container.hide();
    
      }
    });
  } 
});
