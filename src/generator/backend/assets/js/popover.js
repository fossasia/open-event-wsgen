/* Created by aayusharora on June 20, 2017 */

$(document).ready(function(){

  $('.pop-box').hide();
  if($(window).width()<768){
    $('.item').click(function (event) {
      popBox();
    });
  }
  else {
     $('.item').hover(function (event) {
      popBox();
    });
  }   
  function popBox(){

    $('.pop-box').hide();
    event.preventDefault();
    event.stopPropagation();

    var track = $(event.target);
    var link  = track.children(0);

    if($(link).offset()===undefined){

      var offset =$(track).offset();
      var track= track.parent();
    }
   else{

    var offset =$(link).offset();
   }
    
  nextOfpop=$(track).next();
  var position= offset.top-link.height()-30;
  var left= offset.left;

  if( $(window).width()>=320 && $(window).width()< 481){

    var position= offset.top-link.height()-38;  
  }
  else if( $(window).width()>= 481 && $(window).width()<641){

    var position= offset.top-link.height()-46;
  }
  else if( $(window).width()>=641 && $(window).width()< 961){

    var position= offset.top-link.height()-50;
  }
  else if( $(window).width()>=961 && $(window).width()< 1025){

    var left= left-180;
  }
  else {

    var left= left-210;
  }
  if(offset.top){      

    var toptrack = position ;
    $(nextOfpop).css({'top':toptrack,
                      'left':left
    });
    $(track).next().show();
  }
  $(document).mouseup(function (e)
    {
      var container = $(".pop-box");

        if (!container.is(e.target) 
            && container.has(e.target).length === 0 && (e.target)!==$('html').get(0)) 
          {
            container.hide();
          }
    });
  };
})