const loadVideoAndSlides = function(div, videoURL, slideURL) {
  if(videoURL !== null && videoURL !== '') {
    let isVideoDisplayed = $('#desc-' + div).hasClass('in');

    if (videoURL.indexOf('v=') !== -1) {
      videoURL = videoURL.split('v=')[1].replace(/[&#].*/, '');
    }
    else if (videoURL.indexOf('https://youtu.be/') !== -1) {
      videoURL = videoURL.split('https://youtu.be/')[1];
    }

    if (!isVideoDisplayed) {
      $('#desc-' + div).children('div').prepend('<iframe id = "video-' + div + '" class = "video-iframe col-xs-12 col-sm-12 col-md-12" src="https://www.youtube.com/embed/' + videoURL + '"></iframe>');
    }
    else {
      $('#video-' + div).remove();
    }
  }

  if(slideURL !== null && slideURL !== '') {
    let isSlideDisplayed = $('#desc-' + div).hasClass('in');

    if (!isSlideDisplayed) {
      $('#desc-' + div).children('div').prepend('<iframe id = "slide-' + div + '" class = "iframe col-xs-12 col-sm-12 col-md-12" frameborder="0" src="https://view.officeapps.live.com/op/embed.aspx?src=' + slideURL + '"></iframe>');
    }
    else {
      $('#slide-' + div).remove();
    }
  }
};

window.loadVideoAndSlides = loadVideoAndSlides;
