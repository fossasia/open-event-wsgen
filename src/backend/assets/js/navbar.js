/**
 * Created by championswimmer on 27/08/16.
 */
$(function() {
  $('.nav.navbar-nav > li a').removeClass('active');
  var linkUrl=window.location.href.split("/");
  if(findMatch(linkUrl, "tracks.html")){
    $("#trackslink").addClass('active');
  }
  else if(findMatch(linkUrl, "rooms.html")){
    $("#roomslink").addClass('active');
  }
  else if(findMatch(linkUrl, "schedule.html")){
    $("#schedulelink").addClass('active');
  }
  else if(findMatch(linkUrl, "speakers.html")){
    $("#speakerslink").addClass('active');
  }
  else if(findMatch(linkUrl, "sessions.html")){
    $("#sessionslink").addClass('active');
  }
  else {
    $("#homelink").addClass('active');
  }
});

//The function below checks whether any of the entries of the array match against the
//given pattern or not.

function findMatch(arr, pattern){
  // len stores the no. of elements checked so far and flag tells whether we found any
  // pattern or not.
  var len = 0, flag = 0;
  arr.forEach(function(val){
    len += 1;
    if(val.indexOf(pattern) !== -1){
      flag = 1;
    }
  });

  // the check below makes sure that the function doesn't return any value before all
  // of the entries of the array are checked against the pattern.
  if(len === arr.length){
    return flag;
  }
}

$(document).ready(function() {
  var sideslider = $('[data-toggle=collapse-side]');
  var sel = sideslider.attr('data-target');
  var top = $('header[role=banner]').outerHeight();
  sideslider.click(function(event){
    $(sel).css('top', top);
    $(sel).toggleClass('in');
  });
});


// Making navbar translucent on scrolling down
$(document).ready(function(){
  try{
    var navbar = document.getElementsByClassName('js-navbar')[0];
  } catch(e){}

  window.addEventListener('scroll', function () {
    if(!navbar) return;
    if (window.scrollY > 0) {
      if (!navbar.classList.contains('navbar--translucent')) {
        navbar.classList.add('navbar--translucent');
      }
    } else {
      if (navbar.classList.contains('navbar--translucent')) {
        navbar.classList.remove('navbar--translucent');
      }
    }
  });
});
