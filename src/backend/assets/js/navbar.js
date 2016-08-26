/**
 * Created by championswimmer on 27/08/16.
 */
$(function() {
    $('.nav.navbar-nav > li a').removeClass('active');
    var linkUrl=window.location.href.split("/");
    if((linkUrl).indexOf("tracks.html")!=-1){
        $("#trackslink").addClass('active');
    }
    else if((linkUrl).indexOf("rooms.html")!=-1){
        $("#roomslink").addClass('active');
    }
    else if((linkUrl).indexOf("schedule.html")!=-1){
        $("#schedulelink").addClass('active');
    }
    else if((linkUrl).indexOf("speakers.html")!=-1){
        $("#speakerslink").addClass('active');
    }
    else if((linkUrl).indexOf("sessions.html")!=-1){
        $("#sessionslink").addClass('active');
    }
    else {
        $("#homelink").addClass('active');
    }
});