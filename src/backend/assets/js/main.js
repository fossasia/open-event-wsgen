'use strict';

$('h4>.fa-calendar').click(function(event) {
  event.stopPropagation();
});

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  let id = document.getElementById('gcalendar-id').value;
  let key = document.getElementById('gcalendar-key').value;
  let CLIENT_ID = id || '160684527585-baqm9op1fe80reu4f76l1jjcstusq3qb.apps.googleusercontent.com';
  let API_KEY = key || 'AIzaSyDrBzjFDGw3p7AbZqRihL5Ilw46w7RpI7s';
  let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
  let SCOPES = "https://www.googleapis.com/auth/calendar";

  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function() {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  });
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    console.log("Signed IN");
  }
}

function handleAuthClick(title, location, calendarStart, calendarEnd, timezone, description) {
  let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (!isSignedIn) {
    gapi.auth2.getAuthInstance().signIn().then(function() {
      listUpcomingEvents(title, location, calendarStart, calendarEnd, timezone, description);
    });
  } else {
    listUpcomingEvents(title, location, calendarStart, calendarEnd, timezone, description);
  }
}

function listUpcomingEvents(title, location, calendarStart, calendarEnd, timezone, description) {
  let event = {
    'summary': title,
    'location': location,
    'description': description,
    'start': {
      'dateTime': calendarStart,
      'timeZone': timezone
    },
    'end': {
      'dateTime': calendarEnd,
      'timeZone': timezone
    },
    'reminders': {
      'useDefault': false,
      'overrides': [{
          'method': 'email',
          'minutes': 24 * 60
        },
        {
          'method': 'popup',
          'minutes': 10
        }
      ]
    },
    'colorId': '5'
  };

  let request = gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  });
  request.execute(function(event) {
    console.log(event);
    swal({
      title: "Session added to your google calendar!",
      icon: "success",
      button: "OK!",
    });
  });
}

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

window.handleClientLoad = handleClientLoad;
window.initClient = initClient;
window.handleAuthClick = handleAuthClick;
window.updateSigninStatus = updateSigninStatus;
window.listUpcomingEvents = listUpcomingEvents;
window.loadVideoAndSlides = loadVideoAndSlides;
