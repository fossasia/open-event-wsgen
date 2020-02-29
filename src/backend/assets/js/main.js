'use strict';

function handleClientLoad() {
  gapi.load('client:auth2', main.initClient);
}

function initClient() {
  let id = document.getElementById('gcalendar-id').value;
  let key = document.getElementById('gcalendar-key').value;
  let CLIENT_ID = id;
  let API_KEY = key;
  let DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
  let SCOPES = "https://www.googleapis.com/auth/calendar";

  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  })
}

function handleAuthClick(title, location, calendarStart, calendarEnd, timezone, description) {
  let isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  if (!isSignedIn) {
    gapi.auth2.getAuthInstance().signIn().then(function() {
      main.listUpcomingEvents(title, location, calendarStart, calendarEnd, timezone, description);
    });
  } else {
    main.listUpcomingEvents(title, location, calendarStart, calendarEnd, timezone, description);
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

$(document).ready(function () {
  const allFilter = {
    room: {
      dateFilter:'.date-filter',
      place:'.venue-filter',
      room:'.room-filter'
    },

    track: {
      dateFilter:'.date-filter',
      place:'.track-filter',
      room:'.room-filter'
    },

    schedule: {
      dateFilter:'.day-filter',
      calendarFilter: '.calendar',
      place:'.time-filter',
      room:'.schedule-track'
    }
  };

  const showNoResult = function(filterType , calendarMode) {
    const filter = allFilter[filterType];
    var search = false;
    $('.fossasia-filter').each(function() {
      if($(this).is(':visible') && $(this).val().length !== 0) {
        search = true;
      }
    });
    var listFilterLength = $(filter.dateFilter+':visible').length;
    var calendarFilterLength = $('.room:visible').length;
    if ((calendarMode && calendarFilterLength == 0) || (!calendarMode && listFilterLength == 0)) {
      $('#no-results').remove();
      const message = search ? 'No matching results found.' : 'No result found.';
      $('.date-list').after("<p style = 'padding-left: 15px; margin-top: 15px; font-weight: bold; color: red' id='no-results'>"+message+"</p>");
    } else {
      $('#no-results').remove();
    }
  };

  const trackRoomFilter = function (filterType, trackFilterMode, roomFilterMode, trackName, roomName, local_storage_events, mode) {
    let filterVal = '';
    const filter = allFilter[filterType];
    $('.fossasia-filter').each(function() {
      if($(this).is(':visible')) {
        filterVal = $(this).val();
      }
    });
    $(filter.dateFilter).each(function() {
      var temp = true;
      $(this).find(filter.place).each(function() {
        var flag = true;
        var venueName = filterType=='room' ? $(this).find('.text').text() : false;
        $(this).find(filter.room).each(function() {
          var id=$(this).attr('id');
          if ($(this).find('.tip-description').text().toUpperCase().indexOf(filterVal.toUpperCase()) >= 0 ||
            $(this).find('.session-speakers-list a span').text().toUpperCase().indexOf(filterVal.toUpperCase()) >= 0 ||
            $(this).find('.session-speakers-more').text().toUpperCase().indexOf(filterVal.toUpperCase()) >= 0 ||
            $(this).find('.event').text().toUpperCase().indexOf(filterVal.toUpperCase()) >= 0 ||
            $(this).find('.speaker-name').text().toUpperCase().indexOf(filterVal.toUpperCase()) >= 0) {
              var trackVal = $(this).find('.title-inline .blacktext').text();
              var roomVal = venueName ? venueName : $(this).find('#location').text();
              if (mode && local_storage_events[id] != true) {
                $(this).hide();
              } else if (trackFilterMode && trackVal != trackName) {
                $(this).hide();
              } else if (roomFilterMode && roomVal != roomName) {
                $(this).hide();
              } else {
                flag = false;
                $(this).show();
              }
          } else {
            $(this).hide();
          }
        });
        if (flag == true) {
          $(this).hide();
        } else {
          temp = false;
          $(this).show();
        }
      });
      if (temp == true) {
        $(this).hide();
      } else {
        $(this).show();
      }
    });
  };

  function viewsFilter(filterType, curView, date) {
    const filter = allFilter[filterType];
    if(curView === 'list') {
      $(filter.dateFilter).each(function () {
        const showThing = date === 'all' || $(this).hasClass(date);
        $(this).toggleClass('hide', !showThing);
      });
    }
    else if(curView === 'calendar') {
      $(filter.calendarFilter).each(function () {
        const showThing = date === 'all' || $(this).hasClass(date);
        $(this).toggleClass('hide', !showThing);
      });
    }
  }

  window.main = {
    trackRoomFilter: trackRoomFilter,
    showNoResult: showNoResult,
    viewsFilter: viewsFilter,
    handleClientLoad: handleClientLoad,
    initClient: initClient,
    handleAuthClick: handleAuthClick,
    listUpcomingEvents: listUpcomingEvents,
    loadVideoAndSlides: loadVideoAndSlides
  }

});






