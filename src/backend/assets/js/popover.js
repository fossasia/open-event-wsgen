/* Created by aayusharora on June 20, 2017 */

$(document).ready(function () {
  let widthWindow = $(window).width();
      popbox = $(".pop-box");
      headerpop = $(".header-pop");
      sizeevent = $(".sizeevent");
      tracktime = $(".sizeevent span"); 
      speakerinfo = $(".speaker-info");
     
  popbox.addClass('hide');
  if( widthWindow < 768) {
    $(document).on('click','.sizeevent',function (event) {
      popBox(event);
    });
  }
  else {
    headerpop.hover(function (event) {
      popBox(event);
    },function(){
      popbox.addClass('hide');
      hidePopbox();
      hideUnderline();
    });
 }
(function(){

  let imageholder = $(".image-holder");
      speaker = $(".speaker");
      hoverstate= $(".hover-state");
      popbox = $(".pop-box");
      preserve3d= $(".preserve3d");
      widthWindow = $(window).width();
      openflag = 0;
  if( widthWindow < 768) {
    $(document).on('click','.image-holder',function (event) {
      if(openflag === 0) {
       addOverlay(event);
       openflag = 1;
      }
     else {
      removeOverlay(event)
      openflag = 0;
    }
    });
  }
  else {
    imageholder.hover(function(event) {
       addOverlay(event);
    },function(event){
       removeOverlay(event);      
    })
    speaker.hover(function(event){
      if(!(hoverstate).is(event.target)){
        popbox.addClass('hide');
        hidePopbox();
    }
    })
    $(document).hover(function(event){
      popbox.addClass('hide');
      hidePopbox();
    })

  }
    
  })();  

  function popBox(e) {
    event = e || window.event;

    popbox.addClass('hide');
    hideUnderline();
    event.preventDefault();
    event.stopPropagation();
    var track;
    let outerContheight = $(".main").offset().top + $(".main").outerHeight();
    let sizecontainer = sizeevent;
        timeOftrack = tracktime;
        
    if(!sizecontainer.is(event.target)) {
      if(!timeOftrack.is(event.target)){
        track = $(event.target).children("h4");
      }
      else {
        track = $(event.target).parent();
      }
      
    }
    else {
      track = $(event.target);
    }

    let tracknext= $(track).next();
    tracknext.removeClass('hide');
    track.css({
      "text-decoration":"underline"
    });

   let tracktocheck = track.offset().top + track.outerHeight() + tracknext.outerHeight() + 15;
       shift = tracktocheck - outerContheight;
   if(shift > 0){
   
    $(".footer").css({
      "position":"absolute",
      "top": outerContheight + shift,
      "width":"100%",
      "z-index": "999"
    })
  }
   else {
    hidePopbox();
    }

  }
  function hidePopbox () {
    $(".classic").css({
      "position":"static"
    })
  }
  function hideUnderline () {
    sizeevent.css({
      "text-decoration":"none"
    })
  }

  function adjustFooter(event) {
    let pointer = event.target;
    let footer = $('.footer');
    if(!$('.image-holder').is(pointer)){
     imageholder = $(pointer).parent().parent();
    }
    else {
      imageholder = $(pointer);
    }
    let imageHoverheight = imageholder.offset().top;
    let imageContainer = imageholder.outerHeight();
    let popBox         = imageholder.next();
    let popBoxheight   = popBox.outerHeight() ;
    let totalHeight = imageHoverheight + imageContainer + popBoxheight;
    if($('.speakers-row').offset() !== undefined) {
      let speakersRow =  $('.speakers-row').offset().top + $('.speakers-row').outerHeight()+ $('.classic').outerHeight();
      let shift = totalHeight - speakersRow;
        if (shift > 0) {
           $(".classic").css({
            "position":"absolute",
            "top": speakersRow + shift,
            "width":"100%",
            "z-index": "999"
          })
        }
     }
  else {
    hidePopbox();
   
  }
}

  function addOverlay(event) {
    let imageholder = $(".image-holder");
        speaker = $(".speaker");
        hoverstate= $(".hover-state");
        popbox = $(".pop-box");
        preserve3d = $(".preserve3d");

    popbox.addClass('hide');
    event.preventDefault();
    event.stopPropagation();
    
    let imagehover = event.target;
    if((imageholder).is(event.target) ) {
      $(imagehover).next().removeClass('hide');
      $(imagehover).children('.preserve3d').addClass('hover-state');
    }
    else {
      $(imagehover).parents('.image-holder').next().removeClass('hide');
      $(imagehover).parent().children('.preserve3d').addClass('hover-state');
    }
    adjustFooter(event);
  }

  function removeOverlay(event) {
    if(!$('.preserve3d').is(event.target)){
      popbox.addClass('hide');
      $(document).removeClass('hover-state');
    }
    if (!$('.preserve3d').is(event.target) && !$('.pop-box').is(event.target) ){
      adjustFooter(event);

    } 
  }

  if (widthWindow < 768) {
   $(document).mouseup(function(e) {
      let container = popbox;
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.addClass('hide');
         hidePopbox();
         removeOverlay(e);
      }
    });
  } 
});
