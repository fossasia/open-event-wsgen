'use strict';

const moment = require('moment');
const distHelper = require('./dist');
const urlencode  = require('urlencode');
const urljoin = require('url-join');

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

function returnTrackColor(trackInfo, id) {
  if ((trackInfo == null) || (id == null)) {
    return '#000000'
  }
  return trackInfo[id];
}

function foldByTrack(sessions, speakers, trackInfo, reqOpts) {
  
  const trackData = new Map();
  const speakersMap = new Map(speakers.map((s) => [s.id, s]));
  const trackDetails = new Object();

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  sessions.forEach((session) => {
    if (!session.start_time) {
      return;
    }

    // generate slug/key for session
    const date = moment(session.start_time).format('YYYY-MM-DD');
    const trackName = (session.track == null) ? 'deftrack' : session.track.name;
    const slug = date + '-' + slugify(trackName);
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug) && (session.track != null)) {
      track = {
        title: session.track.name,
        color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
        date: moment(session.start_time).format('ddd, Do MMM'),
        slug: slug,
        sessions: []
      };
      trackData.set(slug, track);
    } else {
      track = trackData.get(slug);
    }

    if (reqOpts.assetmode === 'download') {
      const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
      if ((session.audio !== null) && (session.audio.substring(0, 4) === 'http')) {
        session.audio = distHelper.downloadAudio(appFolder, session.audio);
      }
    }

    if (track == undefined) {
      return;
    }
    track.sessions.push({
      start: moment(session.start_time).utcOffset(2).format('HH:mm'),
      end : moment(session.end_time).utcOffset(2).format('HH:mm'),
      title: session.title,
      type: session.session_type.name,
      location: session.microlocation.name,
      speakers_list: session.speakers.map((speaker) => speakersMap.get(speaker.id)),
      description: session.long_abstract,
      session_id: session.id,
      sign_up: session.signup_url,
      video: session.video,
      slides: session.slides,
      audio: session.audio

    });

  });
  
  let tracks = Array.from(trackData.values());

  tracks.sort(byProperty('date'));

  return tracks;
}

function foldByDate(tracks) {
  let dateMap = new Map();

  tracks.forEach((track) => {
    if (!dateMap.has(track.date)) {
      dateMap.set(track.date, {
        caption: track.date,
        tracks: []
      });
    }
    dateMap.get(track.date).tracks.push(track);
  });

  const dates = Array.from(dateMap.values());

  dates.forEach((date) => date.tracks.sort(byProperty('sortKey')));

  return dates;
}

function createSocialLinks(event) {

  const sociallinks = Array.from(event.social_links);

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

function extractEventUrls(event, reqOpts) {
  const sociallinks = Array.from(event.social_links);
  const twitterLink = sociallinks[0];
  const urls= {
    main_page_url: event.event_url,
    logo_url: event.logo,
    background_url: event.background_url,
    date: moment(event.start_time).format('ddd, Do MMM'),
    time: moment(event.start_time).format('HH:mm'),
    name: event.name,
    description: event.description,
    location: event.location_name,
    latitude: event.latitude,
    longitude: event.longitude,
    twitterLink: twitterLink.link

 };
  if (reqOpts.assetmode === 'download') {
    const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
    if ((event.logo !== null) && (event.logo.substring(0, 4) === 'http')) {
     urls.logo_url = distHelper.downloadLogo(appFolder, event.logo);
    }
    if ((event.background_url !== null) && (event.background_url.substring(0, 4) === 'http')) {
     urls.background_url = distHelper.downloadLogo(appFolder, event.background_url);
    }
  }

  return urls;
}

function getCopyrightData(event) {
  const copyright = event.copyright;
  return copyright;
}

function foldByLevel(sponsors ,reqOpts) {
  let levelData = {};
  let level1=0,level2=0,level3=0;
  const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
  sponsors.forEach( (sponsor) => {
    if(sponsor.level==="1" && (sponsor.logo !== null||" ")){
      level1++;
    }
    if (sponsor.level==="2" && (sponsor.logo !== null||" ")) {
       level2++;
    }
     if (sponsor.level==="3" && (sponsor.logo !== null||" ")) {
       level3++;
    }

  });

  sponsors.forEach((sponsor) => {
    if (levelData[sponsor.level] === undefined) {
      levelData[sponsor.level] = [];
    }
    if (sponsor.logo !== null && sponsor.logo != "") {
      if (sponsor.logo.substring(0, 4) === 'http') {
        sponsor.logo = urlencode(distHelper.downloadSponsorPhoto(appFolder, sponsor.logo));
      } else {
        sponsor.logo = urlencode(distHelper.downloadSponsorPhoto(appFolder, urljoin(reqOpts.apiendpoint, sponsor.logo)));

      }
    } 
    else {
      let reg = sponsor.logo.split('');
      if(reg[0] =='/'){
          sponsor.logo = urlencode(sponsor.logo.substring(1,sponsor.logo.length));
        }
        
      }
    const sponsorItem = {
      divclass: '',
      imgsize: '',
      name: sponsor.name,
      logo: sponsor.logo,
      url:  sponsor.url,
      level: sponsor.level,
      description: sponsor.description,
      type: sponsor.sponsor_type
    };

    switch (sponsorItem.level) {
      case '1':
      if(level1 === 1) {
        sponsorItem.divclass = 'largeoffset col-md-4';
      }
      else if(level1 === 2) {
        sponsorItem.divclass = 'sublargeoffset col-md-4';
      }
      else {
        sponsorItem.divclass = 'col-md-4';
      }
        sponsorItem.imgsize = 'large';
        break;
      case '2':
      default:
       if( level2 > 0 && level2 < 6 ) {
        sponsorItem.divclass = 'mediumoffset col-md-2';
      }
      else {
        sponsorItem.divclass = 'col-md-2';
      }
        sponsorItem.imgsize = 'medium';
        break;
      case '3':
      if (level3 === 1) {
         sponsorItem.divclass = 'smalloffset col-md-2';
      }
      else if( level3 >1 && level3 < 5){
        sponsorItem.divclass = 'mediumoffset col-md-2';
      }
      else {
         sponsorItem.divclass = 'col-md-2';
      }
        sponsorItem.imgsize = 'small';
        break;
    }
    levelData[sponsor.level].push(sponsorItem);
  });
  return levelData;
}

function sessionsByRooms(id, sessions, trackInfo) {
  var sessionInRooms = [];
  const DateData = new Map();
  const trackDetails = new Object();
   trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  sessions.forEach((session) => {

   const date = moment(session.start_time).format('YYYY-MM-DD');
   const slug = date + '-' + session.microlocation.name;
    //if (sessionInRooms.indexOf(Object.values(slug))==-1) {
   if (!DateData.has(slug)) {
     var dated = moment(session.start_time).format('YYYY-MM-DD');  
    }
   else {
     dated = "";
   }  
    if(typeof session.microlocation !== 'undefined') {
      if(id === session.microlocation.id) {
        sessionInRooms.push({
          date: dated ,
          name: session.title,
          time: moment(session.start_time).format('HH:mm'),
          color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id)
        });
        DateData.set(slug,moment(session.start_time).format('YYYY-MM-DD'));
      }
  }

});
 
 sessionInRooms.sort(byProperty('date'));
 return sessionInRooms;
}

function foldByRooms(roomsData, sessions, trackInfo) {
  var roomInfo = [];

  roomsData.forEach((room) => {
    roomInfo.push({
      hall: room.name,
      sessionDetail: sessionsByRooms(room.id, sessions,trackInfo)
    });
  });
  return roomInfo;
}

function getAppName(event) {
    const name = event.name;
    return name;
}

function foldBySpeakers(speakers ,sessions, tracksData, reqOpts) {
  if (reqOpts.assetmode === 'download') {
    const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
    speakers.forEach((speaker) => {
      if (speaker.photo !== null && speaker.photo != '') {
        if (speaker.photo.substring(0, 4) === 'http') {
          speaker.photo = urlencode(distHelper.downloadSpeakerPhoto(appFolder, speaker.photo));
        } else {
          speaker.photo = urlencode(distHelper.downloadSpeakerPhoto(appFolder, urljoin(reqOpts.apiendpoint, speaker.photo)))
        }

      }
      else {
        var reg = speaker.photo.split('');
        if(reg[0] =='/'){
          speaker.photo = urlencode(speaker.photo.substring(1,speaker.photo.length));
        }

      }
      //console.log(speaker.photo);
    });
  }

  let speakerslist = [];
  speakers.forEach((speaker) => {
    speakerslist.push({
      country: speaker.country, 
      email: speaker.email, 
      facebook: speaker.facebook , 
      github: speaker.github , 
      linkedin: speaker.linkedin , 
      twitter: speaker.twitter , 
      website: speaker.website ,
      long_biography: speaker.long_biography , 
      mobile: speaker.mobile, 
      name: speaker.name, 
      photo : speaker.photo,
      organisation: speaker.organisation,
      sessions : getAllSessions(speaker.sessions, sessions, tracksData)
    });

 });

  return speakerslist;
}

function getAllSessions(speakerid , session, trackInfo){
  let speakersession =[];
  let sessiondetail = [];
  let trackDetails = new Object();

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  const sessionsMap = new Map(session.map((s) => [s.id, s]));
  speakerid.forEach((speaker) => {
    if(speaker !== undefined ) {
      //console.log(speaker.id);
       sessiondetail.push({
        detail :sessionsMap.get(speaker.id)
      })
      }
  }) 
sessiondetail.forEach((session) => {

  speakersession.push({
      start: moment(session.detail.start_time).utcOffset(2).format('HH:mm'),
      end:   moment(session.detail.end_time).utcOffset(2).format('HH:mm'),
      title: session.detail.title,
      date: moment(session.detail.start_time).format('ddd, Do MMM'),
      color: returnTrackColor(trackDetails, (session.detail.track == null) ? null : session.detail.track.id),
      microlocation: session.detail.microlocation.name
   });
})

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
module.exports.foldBySpeakers = foldBySpeakers;
