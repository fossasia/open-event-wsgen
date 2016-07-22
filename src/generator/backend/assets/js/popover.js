/* Created by aayusharora on June 20, 2017 */

$(document).ready(function() {
  let widthWindow = $(window).width();
      popbox = $('.pop-box');
      headerpop = $('.header-pop');
      outerContheight= $('.main').offset().top + $('.main').outerHeight()
      sizeevent = $('.sizeevent');
      tracktime = $('.sizeevent span'); 

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
      hideUnderline();
    });
  }  
  function popBox(e) {
    event = e || window.event;

    popbox.hide();
    hideUnderline();
    event.preventDefault();
    event.stopPropagation();
    
    let sizecontainer = sizeevent;
    let timeOftrack = tracktime;
    let track;
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

    let tracknext= $(track).next();
    tracknext.show();
    track.css({
      'text-decoration':'underline'
    })
   let tracktocheck= track.offset().top + track.outerHeight() + tracknext.outerHeight() + 15;
   let shift= tracktocheck - outerContheight;
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
    //hideUnderline();
  }
  function hideUnderline() {
    sizeevent.css({
      'text-decoration':'none'
    })
  }
  if (widthWindow < 768) {
   $(document).mouseup(function(e) {
      let container = popbox;
      if (!container.is(e.target)
            && container.has(e.target).length === 0)
          {
        container.hide();
    
      }
    });
  } 
});
