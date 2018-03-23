'use strict';

const moment = require('moment');
const distHelper = require('./dist');
const urljoin = require('url-join');
const async = require('async');
const timeToPixel = 50; // 15 mins = 50 pixels
const columnWidth = 160;
const calendarWidth = 1060;

function byProperty(key) {

  return (a, b) => {
    if (a[key] > b[key]) {
      return 1;
    }
    if (a[key] < b[key]) {
      return -1;
    }

    return 0;
  };
}

function slugify(str) {
  if (typeof str === 'undefined') {
    return '';
  }
  return str.replace(/[^\w]/g, '-').replace(/-+/g, '-').toLowerCase();
}

function replaceSpaceWithUnderscore(str) {
  return str.replace(/ /g, '_');
}

function removeSpace(str) {
  return str.replace(/ /g, '');
}

function returnTrackColor(trackInfo, id) {
  if ((trackInfo == null) || (id == null)) {
    return '#f8f8fa';
  }
  return trackInfo[id];
}

function returnTrackFontColor(trackInfo, id) {
  if ((trackInfo === null) || (id === null)) {
    return '#000000';
  }
  return trackInfo[id];
}

function checkNullHtml(html) {
  if(html === undefined) {
    return true;
  }

  html = html.replace(/<\/?[^>]+(>|$)/g, "").trim();
  return (html === '');
}

function getHoursFromTime(time) {
  return time.split(':')[0];
}

function getMinutessFromTime(time) {
  return time.split(':')[1];
}

function getTimeDifferenceOfDates(startTime, sessionTime) {
  const firstDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), parseInt(getHoursFromTime(startTime)), parseInt(getMinutessFromTime(startTime)), 0);
  const secondDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), parseInt(getHoursFromTime(sessionTime)), parseInt(getMinutessFromTime(sessionTime)), 0);
  return (secondDate - firstDate);
}

function convertTimeToPixel(startTime, sessionTime) {
  const timeDiff = getTimeDifferenceOfDates(startTime, sessionTime);

  const top = timeDiff * timeToPixel/ (1000 * 60 * 15) + timeToPixel; // distance of session from top of the table
  return top;
}

function createTimeLine(startTime, endTime) {
  let timeLine = [];
  let startHour = parseInt(getHoursFromTime(startTime));
  let startMinute = parseInt(getMinutessFromTime(startTime));
  let endHour = parseInt(getHoursFromTime(endTime));
  let i = startMinute;
  let time = '';
  let height = timeToPixel;

  if(i%15!==0){
      i=0;
  }

  while(startHour <= endHour) {
    time = startHour < 10 ? '0' + startHour : startHour;
    time = time + ':' + (i === 0 ? '0' + i : i);
    timeLine.push({
      time: time
    });

    i = (i + 15) % 60;
    height += timeToPixel;
    if(i === 0) {
      startHour++;
    }
  }
  return {
    timeline: timeLine,
    height: height
  };
}

function checkWidth(columns) {
  if(columns * columnWidth > calendarWidth) {
    return columnWidth;
  } else {
    let whiteSpace = (calendarWidth - columns * columnWidth) / columns;
    return columnWidth + whiteSpace;
  }
}

function convertLicenseToCopyright(licence, copyright) {
  var data = {};
  data.licence_url = licence['licence-url'] === undefined ? licence.url : licence['licence-url'];
  data.logo = licence['compact-logo-url'] === undefined ? licence['logo-url'] : licence['compact-logo-url'];
  data.licence = licence['long-name'];
  data.year = copyright.year;
  data.holder = copyright.holder;
  data.holder_url = copyright['holder-url'];
  return data;
}

function foldByTrack(sessions, speakers, trackInfo, reqOpts, next) {
  const trackData = new Map();
  const speakersMap = new Map(speakers.map((s) => [s.id, s]));
  const trackDetails = new Object();
  const trackDetailsFont = new Object();

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
    trackDetailsFont[track.id] = (track['font-color'] !== null) ? track['font-color'] : '#000000';
  });

  async.eachSeries(sessions,(session,callback) => {
    if (!session['starts-at'] || (session.microlocation === null) || (session.state === 'pending') || (session.state === 'rejected') || (session.state === 'draft')) {
      return callback(null);
    }

    // generate slug/key for session
    const date = moment.parseZone(session['starts-at']).format('YYYY-MM-DD');
    const trackName = (session.track == null) ? 'deftrack' : session.track.name;
    const roomName = session.microlocation.name;
    const session_type = (session['session-type'] == null) ? '' : session['session-type'].name ;
    var trackNameUnderscore = replaceSpaceWithUnderscore(trackName);
    const slug = date + '-' + trackNameUnderscore;
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug) && (session.track != null)) {
      track = {
        title: session.track.name,
        color: returnTrackColor(trackDetails, (session.track === null) ? null : session.track.id),
        font_color: returnTrackFontColor(trackDetailsFont, (session.track === null) ? null : session.track.id),
        date: moment.parseZone(session['starts-at']).format('dddd, Do MMM'),
        sortKey: moment.parseZone(session['starts-at']).format('YY-MM-DD'),
        slug: slug,
        sessions: []
      };
      trackData.set(slug, track);
    } else {
      track = trackData.get(slug);
    }

    if (track == undefined) {
      return;
    }
    track.sessions.push({
      startDay: moment.parseZone(session['starts-at']).format('dddd, Do MMM'),
      startDate: moment.parseZone(session['starts-at']).format('YYYY-MM-DD'),
      start: moment.parseZone(session['starts-at']).format('HH:mm'),
      end : moment.parseZone(session['ends-at']).format('HH:mm'),
      title: session.title,
      type: session_type,
      location: roomName,
      speakers_list: session.speakers.map((speaker) => {
        let spkr = speakersMap.get(speaker.id);
        if(spkr['photo-url']){
          spkr.thumb = 'images/speakers/thumbnails/' + (spkr['photo-url']).split('/').pop();
          spkr.photo = spkr['photo-url'];
        }
        if(spkr['short-biography'] !== '') {
          spkr.biography = spkr['short-biography'];
        }
        else {
          spkr.biography = spkr['long-biography'];
        }
        spkr.nameIdSlug = slugify(spkr.name + spkr.id);
        return spkr;
      }),
      description: (checkNullHtml(session['long-abstract'])) ? session['short-abstract'] : session['long-abstract'],
      session_id: session.id,
      sign_up: session['signup-url'],
      video: session['video-url'],
      slides: session['slides-url'],
      audio: session['audio-url']

    });

    if (reqOpts.assetmode === 'download') {
      const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
      if ((session['audio-url'] !== null) && (session['audio-url'] !== '') ) {
        if(session['audio-url'].substring(0, 4) === 'http'){
          distHelper.downloadAudio(appFolder, session['audio-url'], function(audio){
            track.sessions.audio = encodeURI(audio);
            callback();
          });
        }
        else if (reqOpts.datasource === 'eventapi') {
          distHelper.downloadAudio(appFolder, urljoin(reqOpts.apiendpoint,'/', session['audio-url']), function(audio){
            track.sessions.audio = encodeURI(audio);
            callback();
          });
        }
        else {
          callback();
        }
      }
      else {
        callback();
      }
    }
    else {
      callback();
    }
  },function(){
    let tracks = Array.from(trackData.values());
    tracks.sort(byProperty('sortKey'));
    tracks.forEach(function(track) {
      track.sessions.sort(byProperty('start'));
    });
    next(tracks);
  });
}

function foldByTime(sessions, speakers, trackInfo) {
  let dateMap = new Map();
  const speakersMap = new Map(speakers.map((s) => [s.id, s]));
  const trackDetails = {};
  const trackDetailsFont = {};

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
    trackDetailsFont[track.id] = (track['font-color'] !== null) ? track['font-color'] : '#000000';
  });

  sessions.forEach((session) => {
    if(session.microlocation === null || session.state === 'rejected' || session.state === 'pending' || session.state === 'draft' ) {
      return;
    }
    const roomName = session.microlocation.name;
    const session_type = (session['session-type'] == null) ? ' ' : session['session-type'].name ;
    let date = moment.parseZone(session['starts-at']).format('YYYY-MM-DD');
    let startTime = moment.parseZone(session['starts-at']).format('HH:mm');
    let endTime = moment.parseZone(session['ends-at']).format('HH:mm');
    let time = startTime + ' - ' + endTime;
    let speakersNum = session.speakers.length;
    const tracktitle = (session.track == null) ? " " : session.track.name;

    if (!dateMap.has(date)) {
      dateMap.set(date, {
        slug: date,
        date: moment.parseZone(session['starts-at']).format('dddd, Do MMM'),
        times: new Map()
      });
    }

    let timeMap = dateMap.get(date).times;
    if (!timeMap.has(time)) {
      timeMap.set(time, {
        caption: time,
        sessions: []
      });
    }
    timeMap.get(time).sessions.push({
      start: moment.parseZone(session['starts-at']).format('HH:mm'),
      end : moment.parseZone(session['ends-at']).format('HH:mm'),
      color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
      font_color: returnTrackFontColor(trackDetailsFont, (session.track == null) ? null : session.track.id),
      title: session.title,
      type: session_type,
      location: roomName,
      speakers_list: session.speakers.map((speaker) =>  {
        let spkr = speakersMap.get(speaker.id);
        if(spkr['photo-url']){
          spkr.thumb = 'images/speakers/thumbnails/'+ (spkr['photo-url']).split('/').pop();
          spkr.photo = spkr['photo-url'];
        }
        spkr.nameIdSlug = slugify(spkr.name + spkr.id);
        return spkr;
      }),
      description: (checkNullHtml(session['long-abstract'])) ? session['short-abstract'] : session['long-abstract'],
      session_id: session.id,
      sign_up: session['signup-url'],
      video: session['video-url'],
      slides: session['slides-url'],
      audio: session['audio-url'],
      sessiondate: moment.parseZone(session['starts-at']).format('dddd, Do MMM'),
      tracktitle: tracktitle,
      speakers: speakersNum
    });
  });
  const dates = Array.from(dateMap.values());
  dates.sort(byProperty('slug'));
  dates.forEach((date) => {
    const times = Array.from(date.times.values());
    times.sort(byProperty('caption'));
    date.times = times;
  });

  return dates;
}

function foldByDate(tracks) {
  let dateMap = new Map();

  tracks.forEach((track) => {
    if (!dateMap.has(track.date)) {
      dateMap.set(track.date, {
        caption: track.date,
        firstSlug: (track.slug == null) ? null : track.slug.substring(0, track.slug.lastIndexOf('-')),
        tracks: []
      });
    }
    dateMap.get(track.date).tracks.push(track);
  });

  const dates = Array.from(dateMap.values());
  dates.forEach((date) => date.tracks.sort(byProperty('sortKey')));
  return dates;
}

function returnTracknames(sessions, trackInfo) {

  const trackData = new Map();
  const trackDetails = new Object();
  const trackDetailsFont = new Object();

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
    trackDetailsFont[track.id] = (track['font-color'] !== null) ? track['font-color'] : '#000000';
  });

  sessions.forEach((session) => {
    if (!session['starts-at']) {
      return;
    }

    const trackName = (session.track == null) ? 'deftrack' : session.track.name;
    // generate slug/key for session
    const slug = trackName;
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug) && (session.track != null)) {
      track = {
        title: session.track.name,
        color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
        font_color: returnTrackFontColor(trackDetailsFont, (session.track === null) ? null : session.track.id),
        sortKey: session.track.name,
        slug: slug
      };
      trackData.set(slug, track);
    } else {
      track = trackData.get(slug);
    }
  });

  let tracks = Array.from(trackData.values());

  tracks.sort(byProperty('sortKey'));

  return tracks;
}

function returnRoomnames(roomsInfo) {
  var allRoomsList = [];
  roomsInfo.forEach(function(dayRooms) {
    var roomsVenue = dayRooms.venue;
    roomsVenue.forEach(function(tempVenue) {
      allRoomsList.push(tempVenue.venue);
    });
  });
  var uniqueRoomList = allRoomsList.filter((it, i, ar) => ar.indexOf(it) === i);
  uniqueRoomList.sort();
  return uniqueRoomList;
}

function createSocialLinks(event) {

  const sociallinks = Array.from(event['social-links']);

  sociallinks.forEach((link) => {
    link.show = true;
    switch(link.name.toLowerCase()) {
      case 'event main page':
        link.icon = 'home';
        break;
      case 'twitter':
        link.icon = 'twitter';
        break;
      case 'github':
        link.icon = 'github';
        break;
      case 'facebook':
        link.icon = 'facebook';
        break;
      case 'youtube':
        link.icon = 'youtube-play';
        break;
      case 'linkedin':
        link.icon = 'linkedin';
        break;
      case 'vimeo':
        link.icon = 'vimeo';
        break;
      case 'flickr':
        link.icon = 'flickr';
        break;
      case 'google plus':
        link.icon = 'google-plus';
        break;
      case 'instagram':
        link.icon = 'instagram';
        break;
      default:
        link.show = false;
        break;
    }

    if (link.link === '') {
      link.show = false;
    }
  });
  return sociallinks;
}

function extractEventUrls(event, speakers, sponsors, reqOpts, next) {
  const sociallinks = Array.from(event['social-links']);
  var sociallink ="";
  var featuresection = 0;
  var sponsorsection = 0;
  sociallinks.forEach((link) => {
    if(link.name.toLowerCase() === "twitter") {
      sociallink = link.link;
    }
  });

  sponsors.forEach((sponsor) => {
    if( sponsor.id !==undefined && typeof(sponsor.id)==='number') {
      sponsorsection ++;
    }
  });
  speakers.forEach((speaker) => {
    if(speaker['is-featured'] !== undefined && speaker['is-featured'] !==false && speaker['is-featured']===true ) {
      featuresection++;
    }
  });

  const arrayTwitterLink = sociallink.split('/');
  const twitterLink = arrayTwitterLink[arrayTwitterLink.length - 1];

  const urls= {
    main_page_url: event['event-url'],
    logo_url: event['logo-url'],
    background_url: event['original-image-url'],
    background_path: event['original-image-url'],
    date: moment.parseZone(event['starts-at']).format('dddd, Do MMM'),
    time: moment.parseZone(event['starts-at']).format('HH:mm'),
    end_date: moment.parseZone(event['ends-at']).format('dddd, Do MMM'),
    end_time: moment.parseZone(event['ends-at']).format('HH:mm'),
    name: event.name,
    description: event.description,
    location: event['location-name'],
    latitude: event.latitude,
    longitude: event.longitude,
    register: event.ticket_url,
    twitterLink: twitterLink,
    tweetUrl: sociallink,
    email: event.email,
    orgname: event['organizer-name'],
    location_name: event['location-name'],
    featuresection: featuresection,
    sponsorsection: sponsorsection
  };

  if (reqOpts.assetmode === 'download') {
    const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);

    if (event['logo-url'] != null && event['logo-url'] != '') {
      if (event['logo-url'].substring(0, 4) === 'http') {
        distHelper.downloadLogo(appFolder, event['logo-url'], function(result){
          urls.logo_url = encodeURI(result);
        });
      } else if (reqOpts.datasource === 'eventapi') {
        if (event['logo-url'].charAt(0) == '/') event['logo-url'] = event['logo-url'].substr(1);
        distHelper.downloadLogo(appFolder, urljoin(reqOpts.apiendpoint, event['logo-url']),function(result){
          urls.logo_url = encodeURI(result);
        });
      }
      else {
        let reg = event['logo-url'].split('');
        if(reg[0] =='/'){
          urls.logo_url = encodeURI(event['logo-url'].substring(1,event['logo-url'].length));
        }

      }
    }

    if ((event['original-image-url'] != null) && (event['original-image-url'] != '')) {
      if (event['original-image-url'].substring(0, 4) === 'http') {
        distHelper.downloadLogo(appFolder, event['original-image-url'], function(result){
          urls.background_url = result;
          urls.background_path = urls.background_url;
          urls.background_url = urls.background_url.substring(0, urls.background_url.lastIndexOf('.')) + '.jpg';
          next(urls);
        });
      } else if (reqOpts.datasource === 'eventapi') {
        if (event['original-image-url'].charAt(0) == '/') event['original-image-url'] = event['original-image-url'].substr(1);
        distHelper.downloadLogo(appFolder, urljoin(reqOpts.apiendpoint, event['original-image-url']), function(result){
          urls.background_url = encodeURI(result);
          urls.background_path = urls.background_url;
          urls.background_url = urls.background_url.substring(0, urls.background_url.lastIndexOf('.')) + '.jpg';
          next(urls);
        });
      }
      else {
        let reg = event['original-image-url'].split('');
        if(reg[0] =='/'){
          urls.background_url = encodeURI(event['original-image-url'].substring(1,event['original-image-url'].length));
          urls.background_path = urls.background_url;
          urls.background_url = urls.background_url.substring(0, urls.background_url.lastIndexOf('.')) + '.jpg';
          next(urls);
        }
      }

    } else {
      next(urls);
    }
  }


}

function getCopyrightData(event) {
  if(event['licence-details']) {
    return convertLicenseToCopyright(event['licence-details'], event['event-copyright']);
  } else {
    event['event-copyright'].logo = event['event-copyright']['logo-url'];
    event['event-copyright'].license_url = event['event-copyright']['licence-url'];
    event['event-copyright'].holder_url = event['event-copyright']['holder-url'];
    return event['event-copyright'];
  }
}

function sortLevelData(levelData){
  var keys = Object.keys(levelData);
  keys.sort().reverse();
  var lowIndex = parseInt(keys[keys.length-1]);
  var sortedData = {};
  keys.forEach(function(key, index){
    sortedData[key] = levelData[index+lowIndex];
  });
  return sortedData;
}

function foldByLevel(sponsors ,reqOpts, next) {
  let levelData = {};
  let level1=0,level2=0,level3=0;
  const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
  sponsors.forEach( (sponsor) => {
    if(sponsor.level==="1" && (sponsor['logo-url'] !== null||" ")){
      level1++;
    }
    if (sponsor.level==="2" && (sponsor['logo-url'] !== null||" ")) {
      level2++;
    }
    if (sponsor.level==="3" && (sponsor['logo-url'] !== null||" ")) {
      level3++;
    }

  });

  async.eachSeries(sponsors, (sponsor, callback) => {

    if (levelData[sponsor.level] === undefined) {
      levelData[sponsor.level] = [];
    }

    const sponsorItem = {
      divclass: '',
      imgsize: '',
      sponsorimg:'',
      name: sponsor.name,
      logo: sponsor['logo-url'],
      url:  sponsor.url,
      level: sponsor.level,
      description: sponsor.description,
      type: sponsor['type']
    };

    switch (sponsorItem.level) {
      case '1':
        sponsorItem.divclass = 'vcenter col-md-4 col-sm-6';
        sponsorItem.sponsorimg = 'vcenter sponsorimg';
        sponsorItem.imgsize = 'large';
        break;
      case '2':
        sponsorItem.divclass = 'vcenter col-md-4 col-sm-6';
        sponsorItem.sponsorimg = 'vcenter sponsorimg';
        sponsorItem.imgsize = 'medium';
        break;
      case '3':
        sponsorItem.divclass = 'vcenter col-md-4 col-sm-6';
        sponsorItem.sponsorimg = 'vcenter sponsorimg';
        sponsorItem.imgsize = 'small';
        break;
      default:
        sponsorItem.divclass = 'vcenter col-md-4 col-sm-6';
        sponsorItem.sponsorimg = 'vcenter sponsorimg';
    }

    if (sponsor['logo-url'] !== null && sponsor['logo-url'] != "") {
      if (sponsor['logo-url'].substring(0, 4) === 'http') {
        distHelper.downloadSponsorPhoto(appFolder, sponsor['logo-url'], function(result){
          sponsorItem.logo = encodeURI(result);
          levelData[sponsor.level].push(sponsorItem);
          callback();
        });
      } else if (reqOpts.datasource === 'eventapi' ) {
        distHelper.downloadSponsorPhoto(appFolder, urljoin(reqOpts.apiendpoint, sponsor['logo-url']), function(result){
          sponsorItem.logo = encodeURI(result);
          levelData[sponsor.level].push(sponsorItem);
          callback();
        });
      }
      else {
        let reg = sponsor['logo-url'].split('');
        if(reg[0] =='/'){
          sponsorItem.logo = encodeURI(sponsor['logo-url'].substring(1,sponsor['logo-url'].length));
          levelData[sponsor.level].push(sponsorItem);
          callback();
        }
      }
    } else {
      callback();
    }
  }, function(){
    next(sortLevelData(levelData));
  });
}

function sessionsByRooms(id, sessions, trackInfo) {
  var sessionInRooms = [];
  const DateData = new Map();
  const trackDetails = new Object();
  const trackDetailsFont = new Object();

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
    trackDetailsFont[track.id] = (track['font-color'] !== null) ? track['font-color'] : '#000000';
  });

  sessions.forEach((session) => {

    const date = moment.parseZone(session['starts-at']).format('YYYY-MM-DD');
    const slug = date + '-' + session.microlocation.name;
    //if (sessionInRooms.indexOf(Object.values(slug))==-1) {
    if (!DateData.has(slug)) {
      var dated = moment.parseZone(session['starts-at']).format('YYYY-MM-DD');
    }
    else {
      dated = "";
    }
    if(typeof session.microlocation !== 'undefined') {
      if(id === session.microlocation.id) {
        sessionInRooms.push({
          date: dated ,
          name: session.title,
          time: moment.parseZone(session['starts-at']).format('HH:mm'),
          color: returnTrackColor(trackDetails, (session.track === null) ? null : session.track.id),
          font_color: returnTrackFontColor(trackDetailsFont, (session.track === null) ? null : session.track.id)
        });
        DateData.set(slug,moment.parseZone(session['starts-at']).format('YYYY-MM-DD'));
      }
    }

  });

  sessionInRooms.sort(byProperty('date'));
  return sessionInRooms;
}

function foldByRooms(room, sessions, speakers, trackInfo) {
  const roomData = new Map();
  const trackDetails = {};
  const trackDetailsFont = {};
  const speakersMap = new Map(speakers.map((s) => [s.id, s]));
  const microlocationArray = [];

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
    trackDetailsFont[track.id] = (track['font-color'] !== null) ? track['font-color'] : '#000000';
  });

  sessions.forEach((session) => {
    if (!session['starts-at'] || (session.microlocation === null) || (session.state === 'pending') || (session.state === 'rejected') || (session.state === 'draft')) {
      return;
    }

    // generate slug/key for session
    const date = moment.parseZone(session['starts-at']).format('YYYY-MM-DD');
    const roomName = session.microlocation.name;
    const slug = date ;
    const tracktitle = (session.track == null) ? " " : session.track.name;
    const start = moment.parseZone(session['starts-at']).format('HH:mm');
    const end = moment.parseZone(session['ends-at']).format('HH:mm');

    let room = null;

    // set up room if it does not exist
    if (!roomData.has(slug) && (session.microlocation != null)) {
      room = {
        date: moment.parseZone(session['starts-at']).format('dddd, Do MMM'),
        sortKey: moment.parseZone(session['starts-at']).format('YY-MM-DD'),
        slug: slug,
       ['starts-at']: start,
       ['ends-at']: end,
        timeLine: [],
        sessions: []
      };
      roomData.set(slug,room);
    } else {
      room = roomData.get(slug);
    }

    if (room == undefined) {
      return;
    }

    let venue = '';
    if(session.microlocation !== null ) {
      const slug2 = date + '-' + session.microlocation.name ;
      if(microlocationArray.indexOf(slug2) == -1 ) {
        microlocationArray.push(slug2);
      }
      venue = session.microlocation.name;
    }

    if(room['starts-at'] == slug || room['starts-at'] > start ) {
      room['starts-at'] = start;
    }

    if(room['ends-at'] == slug || room['ends-at'] < end ) {
      room['ends-at'] = end;
    }

    room.sessions.push({
      start: start,
      color: returnTrackColor(trackDetails, (session.track === null) ? null : session.track.id),
      font_color: returnTrackFontColor(trackDetailsFont, (session.track === null) ? null : session.track.id),
      venue: venue,
      end : end,
      title: session.title,
      type: (session['session-type'] == null) ? '' : session['session-type'].name,
      description: (checkNullHtml(session['long-abstract'])) ? session['short-abstract'] : session['long-abstract'],
      session_id: session.id,
      audio:session['audio-url'],
      speakers_list: session.speakers.map((speaker) => {
        let spkr = speakersMap.get(speaker.id);
        if(spkr['photo-url']){
          spkr.thumb = 'images/speakers/thumbnails/' + (spkr['photo-url']).split('/').pop();
        }
        if(spkr['short-biography'] !== '') {
          spkr.biography = spkr['short-biography'];
        }
        else {
          spkr.biography = spkr['long-biography'];
        }
        spkr.nameIdSlug = slugify(spkr.name + spkr.id);
        return spkr;
      }),
      tracktitle: tracktitle,
      sessiondate: moment.parseZone(session['starts-at']).format('dddd, Do MMM'),
      roomname: roomName,
      sortKey: venue + moment.parseZone(session['starts-at']).format('HH:mm')
    });
  });

  let roomsDetail = Array.from(roomData.values());
  roomsDetail.sort(byProperty('sortKey'));

  let roomsDetailLength = roomsDetail.length;
  for (let i = 0; i < roomsDetailLength; i++) {
    // sort all sessions in each day by 'venue + date'
    roomsDetail[i].sessions.sort(byProperty('sortKey'));
    roomsDetail[i].venue = [];
    let startTime = roomsDetail[i]['starts-at'];
    let endTime = roomsDetail[i]['ends-at'];
    let timeinfo = createTimeLine(startTime, endTime);
    roomsDetail[i].timeline = timeinfo.timeline;
    roomsDetail[i].height = timeinfo.height;
    roomsDetail[i].timeToPixel = timeToPixel;

    // remove venue names from all but the 1st session in each venue
    let sessionsLength = roomsDetail[i].sessions.length;
    let prevVenue = '';
    let tempVenue = {};
    tempVenue.sessions = [];

    for (let j = 0; j < sessionsLength; j++) {

      roomsDetail[i].sessions[j].top = convertTimeToPixel(startTime, roomsDetail[i].sessions[j].start);
      roomsDetail[i].sessions[j].bottom = convertTimeToPixel(startTime, roomsDetail[i].sessions[j].end);
      roomsDetail[i].sessions[j].height = roomsDetail[i].sessions[j].bottom - roomsDetail[i].sessions[j].top;

      if (roomsDetail[i].sessions[j].venue == prevVenue) {
        roomsDetail[i].sessions[j].venue = '';
        tempVenue.sessions.push(roomsDetail[i].sessions[j]);
      } else {
        if(JSON.stringify(tempVenue) != JSON.stringify({}) && prevVenue != '') {
          roomsDetail[i].venue.push(tempVenue);
          tempVenue = {};
          tempVenue.sessions = [];
        }
        tempVenue.venue = roomsDetail[i].sessions[j].venue;
        tempVenue.slug = replaceSpaceWithUnderscore(tempVenue.venue);
        tempVenue.sessions.push(roomsDetail[i].sessions[j]);
        prevVenue = roomsDetail[i].sessions[j].venue;
      }
    }
    roomsDetail[i].venue.push(tempVenue);
    roomsDetail[i].sessions = {};
    roomsDetail[i].width = checkWidth(roomsDetail[i].venue.length);
  }
  return roomsDetail;
}

function getAppName(event) {
  const name = event.name;
  return name;
}

function getOrganizerName(event) {
  const name = event['organizer-name'];
  return name;
}

function foldBySpeakers(speakers ,sessions, tracksData, reqOpts, next) {
  if (reqOpts.assetmode === 'download') {
    const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
    async.eachOfSeries(speakers, (speaker, key, callback) => {

      if (speaker['photo-url'] !== null && speaker['photo-url'] != '') {
        if (speaker['photo-url'].substring(0, 4) === 'http') {
          distHelper.downloadSpeakerPhoto(appFolder, speaker['photo-url'], function(result){
            speakers[key]['photo-url'] = encodeURI(result);
            speakers[key]['photo-url'] = speakers[key]['photo-url'].substring(0, speakers[key]['photo-url'].lastIndexOf('.')) + '.jpg';
            callback();
          });
        }
        else if (reqOpts.datasource === 'eventapi' ) {
          distHelper.downloadSpeakerPhoto(appFolder, urljoin(reqOpts.apiendpoint, speaker['photo-url']), function(result){
            speakers[key]['photo-url'] = encodeURI(result);
            speakers[key]['photo-url'] = speakers[key]['photo-url'].substring(0, speakers[key]['photo-url'].lastIndexOf('.')) + '.jpg';
            callback();
          });
        } else {
          var reg = speaker['photo-url'].split('');
          if(reg[0] =='/'){
            speakers[key]['photo-url'] = encodeURI(speaker['photo-url'].substring(1,speaker['photo-url'].length));
            speakers[key]['photo-url'] = speakers[key]['photo-url'].substring(0, speakers[key]['photo-url'].lastIndexOf('.')) + '.jpg';
            callback();
          }
        }
      } else {
        callback();
      }
    }, function(){
      let speakerslist = [];
      speakers.forEach((speaker) => {
        if(speaker['photo-url']){
          var thumb = 'images/speakers/thumbnails/' + (speaker['photo-url']).split('/').pop();
        }
        let allSessions = getAllSessions(speaker.sessions, sessions, tracksData);
        if (allSessions.length) {
          speakerslist.push({
            country: speaker.country,
            featured: speaker['is-featured'],
            email: speaker.email,
            facebook: speaker.facebook ,
            github: speaker.github ,
            linkedin: speaker.linkedin ,
            twitter: speaker.twitter ,
            website: speaker.website ,
            long_biography: (checkNullHtml(speaker['long-biography'])) ? speaker['short-biography'] : speaker['long-biography'],
            mobile: speaker.mobile,
            name: speaker.name,
            thumb: thumb,
            photo: speaker['photo-url'],
            organisation: speaker.organisation,
            position: speaker.position,
            sessions: allSessions,
            speaker_id: speaker.id,
            nameIdSlug: slugify(speaker.name + speaker.id)
          });
        }
        speakerslist.sort(byProperty('name'));
      });
      next(speakerslist);
    });
  }
}

function getAllSessions(speakerid , session, trackInfo){
  let speakersession =[];
  let sessiondetail = [];
  let trackDetails = {};
  let trackDetailsFont = {};

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
    trackDetailsFont[track.id] = (track['font-color'] !== null) ? track['font-color'] : '#000000';
  });

  const sessionsMap = new Map(session.map((s) => [s.id, s]));
  speakerid.forEach((speaker) => {
    if(speaker !== undefined) {
      var speakerSessionDetail = sessionsMap.get(speaker.id);
      if(speakerSessionDetail === undefined) {
        return;
      }
      if(speakerSessionDetail.microlocation !== null && (speakerSessionDetail.state === 'accepted' || speakerSessionDetail.state === 'confirmed')) {
        sessiondetail.push({
          detail:speakerSessionDetail
        });
      }
    }
  });
  sessiondetail.forEach((session) => {
    const roomname = (session.detail == null || session.detail.microlocation == null) ?' ': session.detail.microlocation.name;
    if(session.detail !== undefined ) {
      speakersession.push({
        sortKey :  moment.parseZone(session.detail['starts-at']).format('YYYY-MM-DD HH:MM'),
        start: moment.parseZone(session.detail['starts-at']).format('HH:mm'),
        end:   moment.parseZone(session.detail['ends-at']).format('HH:mm'),
        title: session.detail.title,
        date: moment.parseZone(session.detail['starts-at']).format('ddd, Do MMM'),
        color: returnTrackColor(trackDetails, (session.detail.track === null) ? null : session.detail.track.id),
        font_color: returnTrackFontColor(trackDetailsFont, (session.detail.track === null) ? null : session.detail.track.id),
        microlocation: roomname,
        session_id: session.detail.id
      });
    }

  });
  speakersession.sort(byProperty('sortKey'));
  return speakersession;

}
module.exports.foldByTrack = foldByTrack;
module.exports.foldByDate = foldByDate;
module.exports.createSocialLinks = createSocialLinks;
module.exports.extractEventUrls = extractEventUrls;
module.exports.getCopyrightData = getCopyrightData;
module.exports.foldByLevel = foldByLevel;
module.exports.foldByRooms = foldByRooms;
module.exports.slugify = slugify;
module.exports.getAppName = getAppName;
module.exports.getOrganizerName = getOrganizerName;
module.exports.foldBySpeakers = foldBySpeakers;
module.exports.foldByTime = foldByTime;
module.exports.returnTracknames = returnTracknames;
module.exports.checkNullHtml = checkNullHtml;
module.exports.replaceSpaceWithUnderscore = replaceSpaceWithUnderscore;
module.exports.removeSpace = removeSpace;
module.exports.returnRoomnames = returnRoomnames;
