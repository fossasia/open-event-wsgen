'use strict';

const loadVideoAndSlides = function(div, videoURL, slideURL) {
  const descriptionDiv = $('#desc-' + div);
  const speakerDiv = $('#speaker-' + div);

  if(videoURL !== null && videoURL !== '') {
    const isVideoDisplayed = descriptionDiv.hasClass('in');
    let video = videoURL;
    const faviconDiv = $('#v' + div);

    if (videoURL.indexOf('v=') !== -1) {
      video = videoURL.split('v=')[1].replace(/[&#].*/, '');
    } else if (videoURL.indexOf('https://youtu.be/') !== -1) {
      video = videoURL.split('https://youtu.be/')[1];
    }

    if (!isVideoDisplayed && $('[id="video-' + div + '"]').length === 0) {
      faviconDiv.css('display', 'block');
      speakerDiv.prepend('<iframe id = "video-' + div + '" class = "video-iframe col-xs-12 col-sm-12 col-md-12" src="https://www.youtube.com/embed/' + video + '" frameborder="0" allowfullscreen></iframe>');
    } else if(isVideoDisplayed) {
      faviconDiv.css('display', 'none');
      $('#video-' + div).remove();
    }
  }

  if(slideURL !== null && slideURL !== '') {
    const isSlideDisplayed = descriptionDiv.hasClass('in');

    if (!isSlideDisplayed && $('[id="slide-' + div + '"]').length === 0) {
      if (slideURL.indexOf('pdf') !== -1) {
        speakerDiv.prepend('<iframe id = "slide-' + div + '" class = "iframe col-xs-12 col-sm-12 col-md-12" frameborder="0" src="https://docs.google.com/gview?url=' + slideURL + '&embedded=true"></iframe>');
      } else if (slideURL.indexOf('ppt') !== -1 || slideURL.indexOf('pptx') !== -1) {
        speakerDiv.prepend('<iframe id = "slide-' + div + '" class = "iframe col-xs-12 col-sm-12 col-md-12" frameborder="0" src="https://view.officeapps.live.com/op/embed.aspx?src=' + slideURL + '"></iframe>');
      }
    }
    else if(isSlideDisplayed) {
      $('#slide-' + div).remove();
    }
  }
};

window.loadVideoAndSlides = loadVideoAndSlides;
