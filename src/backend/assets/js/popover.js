/* Created by aayusharora on June 20, 2017 */

$(document).ready(function () {
  let widthWindow = $(window).width();
      popbox = $(".pop-box");
      headerpop = $(".header-pop");
      sizeevent = $(".sizeevent");
      tracktime = $(".sizeevent span"); 
      speakerinfo = $(".speaker-info");
     
  popbox.hide();
  if( widthWindow < 768) {
    $(document).on('click','.sizeevent',function (event) {
      popBox(event);
    });
  }
  else {
    headerpop.hover(function (event) {
      popBox(event);
    },function(){
      popbox.hide();
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
      responsiveoverlay= $(".responsive-overlay");

    imageholder.hover(function(event) {
      popbox.hide();
      event.preventDefault();
      event.stopPropagation();
      
      let imagehover = event.target;
      console.log(imagehover);
      if((imageholder).is(event.target) ) {
        $(imagehover).next().show();
        $(imagehover).children('.preserve3d').addClass('hover-state');
      }
      else {
        $(imagehover).parent().next().show();
        $(imagehover).parent().children('.preserve3d').addClass('hover-state');
      }
    },function(){
      if(!$('.preserve3d').is(event.target)){
         popbox.hide();
         $(document).removeClass('hover-state');
      }
      
    })
    speaker.hover(function(event){
      if(!(hoverstate).is(event.target)){
        popbox.hide();
    }
    })
    $(document).hover(function(event){
      popbox.hide();
    })

    imageholder.hover(function (event) {
    if(imageholder.is(event.target)) {
      var trackin =$(event.target).next();
   }  
    else {
      trackin = $(event.target).parents('.image-holder').next();
    }
    popbox.hide();
    event.preventDefault();
    event.stopPropagation();
    trackin.show();
    },function(){

    if (!$('.preserve3d').is(event.target) && !$('.pop-box').is(event.target) ){
         popbox.hide();
       } 
    });

  })();  

  function popBox(e) {
    event = e || window.event;

    popbox.hide();
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
    tracknext.show();
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
    $(".footer").css({
      "position":"static"
    })
  }
  function hideUnderline () {
    sizeevent.css({
      "text-decoration":"none"
    })
  }
  if (widthWindow < 768) {
   $(document).mouseup(function(e) {
      let container = popbox;
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
         hidePopbox();
      }
    });
  } 
});
