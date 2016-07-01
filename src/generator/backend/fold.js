'use strict';


var exports = module.exports = {};

const fs = require('fs-extra');
const moment = require('moment');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');
const distHelper = require('./dist');

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

  return trackInfo[id];
}
function foldByTrack(sessions, speakers, trackInfo, reqOpts) {

  if (reqOpts.assetmode == 'download') {
    speakers.forEach((speaker) => {
      if ((speaker.photo !== null) && (speaker.photo.substring(0, 4) == 'http')) {
        speaker.photo = distHelper.downloadSpeakerPhoto(speaker.photo);
      }
    });
  }

  let trackData = new Map();
  let speakersMap = new Map(speakers.map((s) => [s.id, s]));
  let trackDetails= new Object();
  trackInfo.forEach((track) => {
    trackDetails[track.id]=track.key_color;
  });

  sessions.forEach((session) => {
    if (!session.start_time) {
      return;
    }

    // generate slug/key for session
    let date = moment(session.start_time).format('YYYY-MM-DD');
    let slug = date + '-' + slugify(session.track.name);
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug)) {
      track = {
        title: session.track.name,
        color: returnTrackColor(trackDetails,session.track.id),
        date: moment(session.start_time).locale('de').format('ddd D. MMM') + ' / ' + moment(session.start_time).format('ddd, Do MMM'),
        slug: slug,
        sessions: []
      };
      trackData.set(slug, track);
    } else {
      track = trackData.get(slug);
    }

    if (reqOpts.assetmode == 'download') {
      if ((session.audio !== null) && (session.audio.substring(0, 4) == 'http')) {
        session.audio = distHelper.downloadAudio(session.audio);
      }
    }
    
    track.sessions.push({
      start: moment(session.start_time).utcOffset(2).format('HH:mm'),
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

  tracks.sort(byProperty('sortKey'));

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

function createSocialLinks(services) {
  const sociallinks = Array.from(services.services);

  sociallinks.forEach((link) => {
    link.show = true;
    switch(link.service.toLowerCase()) {
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

    if (link.url === '') {
      link.show = false;
    }
  });
  return sociallinks;
}


function extractEventUrls(services) {
  const urls = services.logoico;

  return urls;
}

function getCopyrightData(services) {
  const copyright = services.copyright;

  return copyright;
}

function foldByLevel(sponsors) {
  let levelData = {};
  sponsors.forEach((sponsor) => {
    if (levelData[sponsor.level] === undefined) {
      levelData[sponsor.level] = [];
    }

    const sponsorItem = {
      divclass: '',
      imgsize: '',
      name: sponsor.name,
      image: sponsor.image,
      link: sponsor.link,
      level: sponsor.level,
      description: sponsor.description,
      type: sponsor.type
    };

    switch (sponsorItem.level) {
      case '1':
        sponsorItem.divclass = 'largeoffset col-md-4';
        sponsorItem.imgsize = 'large';
        break;
      case '2':
      default:
        sponsorItem.divclass = 'mediumoffset col-md-2';
        sponsorItem.imgsize = 'medium';
        break;
      case '3':
        sponsorItem.divclass = 'largeoffset col-md-2';
        sponsorItem.imgsize = 'small';
        break;
    }
    levelData[sponsor.level].push(sponsorItem);
  });
  return levelData;
}

function sessionsByRooms (id, sessions) {
  var sessionInRooms=[];
    sessions.forEach((session)=>{
      if(session.microlocation!==undefined) {
         if(id === session.microlocation.id) {
           sessionInRooms.push({
             name:session.title,
             time: moment(session.start_time).utcOffset(2).format('HH:mm')
           })
        }
      }

    });

    return sessionInRooms;
}

function foldByRooms(roomsData,sessions){
  var roomInfo=[];
  roomsData.forEach((room)=>{
    roomInfo.push({
      hall: room.name,
      date: moment(sessions.start_time).format('YYYY-MM-DD'),
      sessionDetail:sessionsByRooms(room.id,sessions)
    })
  });
  return roomInfo;
}

module.exports.foldByTrack = foldByTrack;
module.exports.foldByDate = foldByDate;
module.exports.createSocialLinks = createSocialLinks;
module.exports.extractEventUrls = extractEventUrls;
module.exports.getCopyrightData = getCopyrightData;
module.exports.foldByLevel = foldByLevel;
module.exports.foldByRooms = foldByRooms;
