'use strict';

const moment = require('moment');
const distHelper = require('./dist');
const urljoin = require('url-join');
const async = require('async');

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
    return '#f8f8fa'
  }
  return trackInfo[id];
}

function foldByTrack(sessions, speakers, trackInfo, reqOpts, next) {
  const trackData = new Map();
  const speakersMap = new Map(speakers.map((s) => [s.id, s]));
  const trackDetails = new Object();

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });
    
  async.eachSeries(sessions,(session,callback) => {
    if (!session.start_time) {
      return;
    }

    // generate slug/key for session
    const date = moment.utc(session.start_time).local().format('YYYY-MM-DD');
    const trackName = (session.track == null) ? 'deftrack' : session.track.name;
    const roomName = (session.microlocation == null) ? ' ' : session.microlocation.name;
    const session_type = (session.session_type == null) ? ' ' : session.session_type.name ;
    const slug = date + '-' + trackName;
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug) && (session.track != null)) {
      track = {
        title: session.track.name,
        color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
        date: moment.utc(session.start_time).local().format('dddd, Do MMM'),
        sortKey: moment.utc(session.start_time).local().format('YY-MM-DD'),
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
      start: moment.utc(session.start_time).local().format('HH:mm'),
      end : moment.utc(session.end_time).local().format('HH:mm'),
      title: session.title,
      type: session_type,
      location: roomName,
      speakers_list: session.speakers.map((speaker) => {
        let spkr = speakersMap.get(speaker.id);
        if(spkr.photo){
           spkr.thumb = 'images/speakers/thumbnails/' + (spkr.photo).split('/').pop();
        }
        spkr.nameIdSlug = slugify(spkr.name + spkr.id);
        return spkr;
      }),
      description: session.long_abstract,
      session_id: session.id,
      sign_up: session.signup_url,
      video: session.video,
      slides: session.slides,
      audio: session.audio

    });

    if (reqOpts.assetmode === 'download') {
      const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
      if ((session.audio !== null) && (session.audio !== '') ) {
        if(session.audio.substring(0, 4) === 'http'){
          distHelper.downloadAudio(appFolder, session.audio, function(audio){
             track.sessions.audio = encodeURI(audio);
             callback();  
          });
        }
        else if (reqOpts.datasource === 'eventapi') {
           distHelper.downloadAudio(appFolder, urljoin(reqOpts.apiendpoint,'/', session.audio), function(audio){
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

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  sessions.forEach((session) => {
    const roomName = (session.microlocation == null) ? ' ' : session.microlocation.name;
    const session_type = (session.session_type == null) ? ' ' : session.session_type.name ;
    let date = moment.utc(session.start_time).local().format('YYYY-MM-DD');
    let time = moment.utc(session.start_time).local().format('HH:mm');
    let speakersNum = session.speakers.length;
    const tracktitle = (session.track == null) ? " " : session.track.name;
      
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        slug: date,
        date: moment.utc(session.start_time).local().format('dddd, Do MMM'),
        times: new Map()
      })
    }
    let timeMap = dateMap.get(date).times;
    if (!timeMap.has(time)) {
      timeMap.set(time, {
        caption: time,
        sessions: []
      })
    }
    timeMap.get(time).sessions.push({
      start: moment.utc(session.start_time).local().format('HH:mm'),
      end : moment.utc(session.end_time).local().format('HH:mm'),
      color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
      title: session.title,
      type: session_type,
      location: roomName,
      speakers_list: session.speakers.map((speaker) =>  {
        let spkr = speakersMap.get(speaker.id);
        if(spkr.photo){
           spkr.thumb = 'images/speakers/thumbnails/'+ (spkr.photo).split('/').pop();
        }
        spkr.nameIdSlug = slugify(spkr.name + spkr.id);
        return spkr;
      }),
      description: session.long_abstract,
      session_id: session.id,
      sign_up: session.signup_url,
      video: session.video,
      slides: session.slides,
      audio: session.audio,
      sessiondate: moment.utc(session.start_time).local().format('dddd, Do MMM'),
      tracktitle: tracktitle,
      speakers: speakersNum
    });
  });
  const dates = Array.from(dateMap.values());
  dates.sort(byProperty('caption'));
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
        firstSlug: track.slug,
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

  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  sessions.forEach((session) => {
    if (!session.start_time) {
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
        sortKey: moment.utc(session.start_time).local().format('YY-MM-DD'),
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

function extractEventUrls(event, speakers, sponsors, reqOpts, next) {
  const sociallinks = Array.from(event.social_links);
  var sociallink ="";
  var featuresection = 0;
  var sponsorsection = 0;
  sociallinks.forEach((link) => {
    if(link.name.toLowerCase() === "twitter") {
      sociallink = link.link;
    }
  }) 

  sponsors.forEach((sponsor) => {
    if( sponsor.id !==undefined && typeof(sponsor.id)==='number') {
      sponsorsection ++;
    }
  }) 
  speakers.forEach((speaker) => {
    if(speaker.featured !== undefined && speaker.featured !==false && speaker.featured===true ) {
         featuresection++;
    }
  }) 

  const arrayTwitterLink = sociallink.split('/');
  const twitterLink = arrayTwitterLink[arrayTwitterLink.length - 1];

  const urls= {
    main_page_url: event.event_url,
    logo_url: event.logo,
    background_url: event.background_image,
    date: moment.utc(event.start_time).local().format('dddd, Do MMM'),
    time: moment.utc(event.start_time).local().format('HH:mm'),
    name: event.name,
    description: event.description,
    location: event.location_name,
    latitude: event.latitude,
    longitude: event.longitude,
    register: event.ticket_url,
    twitterLink: twitterLink,
    tweetUrl: sociallink,
    email: event.email,
    orgname: event.organizer_name,
    location_name: event.location_name,
    featuresection: featuresection,
    sponsorsection: sponsorsection
  };

  if (reqOpts.assetmode === 'download') {
    const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);

    if (event.logo != null && event.logo != '') {
      if (event.logo.substring(0, 4) === 'http') {
        distHelper.downloadLogo(appFolder, event.logo, function(result){
          urls.logo_url = encodeURI(result);
        });
      } else if (reqOpts.datasource === 'eventapi') {
        if (event.logo.charAt(0) == '/') event.logo = event.logo.substr(1);
        distHelper.downloadLogo(appFolder, urljoin(reqOpts.apiendpoint, event.logo),function(result){
          urls.logo_url = encodeURI(result);
        });
      }
      else {
        let reg = event.logo.split('');
        if(reg[0] =='/'){
          urls.logo_url = encodeURI(event.logo.substring(1,event.logo.length));
        }

      }
    }

    if ((event.background_image != null) && (event.background_image != '')) {
      if (event.background_image.substring(0, 4) === 'http') {
        distHelper.downloadLogo(appFolder, event.background_image, function(result){
          urls.background_url = result;
          next(urls);
        });
      } else if (reqOpts.datasource === 'eventapi') {
        if (event.background_image.charAt(0) == '/') event.background_image = event.background_image.substr(1);
        distHelper.downloadLogo(appFolder, urljoin(reqOpts.apiendpoint, event.background_image), function(result){
          urls.background_url = encodeURI(result);
          next(urls);
        });
      }
      else {
        let reg = event.background_image.split('');
        if(reg[0] =='/'){
          urls.background_url = encodeURI(event.background_image.substring(1,event.background_image.length));
          next(urls);  
        }
      }
    } else {
      next(urls);
    }
  }

  
}

function getCopyrightData(event) {
  const copyright = event.copyright;
  return copyright;
}

function foldByLevel(sponsors ,reqOpts, next) {
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

  async.eachSeries(sponsors, (sponsor, callback) => {

    if (levelData[sponsor.level] === undefined) {
      levelData[sponsor.level] = [];
    }

    const sponsorItem = {
      divclass: '',
      imgsize: '',
      sponsorimg:'',
      name: sponsor.name,
      logo: sponsor.logo,
      url:  sponsor.url,
      level: sponsor.level,
      description: sponsor.description,
      type: sponsor.sponsor_type
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

    if (sponsor.logo !== null && sponsor.logo != "") {
      if (sponsor.logo.substring(0, 4) === 'http') {
        distHelper.downloadSponsorPhoto(appFolder, sponsor.logo, function(result){
          sponsorItem.logo = encodeURI(result);
          levelData[sponsor.level].push(sponsorItem);
          callback();
        });
      } else if (reqOpts.datasource === 'eventapi' ) {
        distHelper.downloadSponsorPhoto(appFolder, urljoin(reqOpts.apiendpoint, sponsor.logo), function(result){
          sponsorItem.logo = encodeURI(result);
          levelData[sponsor.level].push(sponsorItem);
          callback();
        });
      }
      else {
      let reg = sponsor.logo.split('');
      if(reg[0] =='/'){
          sponsorItem.logo = encodeURI(sponsor.logo.substring(1,sponsor.logo.length));
          levelData[sponsor.level].push(sponsorItem);
          callback();
        }
      }
    } else {
      callback();
    }
  }, function(){
    next(levelData);
  });
}

function sessionsByRooms(id, sessions, trackInfo) {
  var sessionInRooms = [];
  const DateData = new Map();
  const trackDetails = new Object();
   trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  sessions.forEach((session) => {

   const date = moment.utc(session.start_time).local().format('YYYY-MM-DD');
   const slug = date + '-' + session.microlocation.name;
    //if (sessionInRooms.indexOf(Object.values(slug))==-1) {
   if (!DateData.has(slug)) {
     var dated = moment.utc(session.start_time).local().format('YYYY-MM-DD');
    }
   else {
     dated = "";
   }
    if(typeof session.microlocation !== 'undefined') {
      if(id === session.microlocation.id) {
        sessionInRooms.push({
          date: dated ,
          name: session.title,
          time: moment.utc(session.start_time).local().format('HH:mm'),
          color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id)
        });
        DateData.set(slug,moment.utc(session.start_time).local().format('YYYY-MM-DD'));
      }
  }

});

 sessionInRooms.sort(byProperty('date'));
 return sessionInRooms;
}

function foldByRooms(room, sessions, speakers, trackInfo) {
  const roomData = new Map();
  const trackDetails = new Object();
  const speakersMap = new Map(speakers.map((s) => [s.id, s]));
  const microlocationArray = [];
  trackInfo.forEach((track) => {
    trackDetails[track.id] = track.color;
  });

  sessions.forEach((session) => {
    if (!session.start_time) {
      return;
    }

    // generate slug/key for session
    const date = moment.utc(session.start_time).local().format('YYYY-MM-DD');
    const roomName = (session.microlocation == null) ? ' ' : session.microlocation.name;
    const slug = date ;
    const tracktitle = (session.track == null) ? " " : session.track.name;
    let room = null;

    // set up room if it does not exist
    if (!roomData.has(slug) && (session.microlocation != null)) {
      room = {
        date: moment.utc(session.start_time).local().format('dddd, Do MMM'),
        sortKey: moment.utc(session.start_time).local().format('YY-MM-DD'),
        slug: slug,
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

    room.sessions.push({
      start: moment.utc(session.start_time).local().format('HH:mm'),
      color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
      venue: venue,
      end : moment.utc(session.end_time).local().format('HH:mm'),
      title: session.title,
      type: (session.session_type == null) ? ' ' : session.session_type.name,
      description: session.long_abstract,
      session_id: session.id,
      audio:session.audio,
      speakers_list: session.speakers.map((speaker) => {
        let spkr = speakersMap.get(speaker.id);
        if(spkr.photo){
           spkr.thumb = 'images/speakers/thumbnails/' + (spkr.photo).split('/').pop();
        }
        spkr.nameIdSlug = slugify(spkr.name + spkr.id);
        return spkr;
      }),
      tracktitle: tracktitle,
      sessiondate: moment.utc(session.start_time).local().format('dddd, Do MMM'),
      roomname: roomName,
      sortKey: venue + moment.utc(session.start_time).local().format('HH:mm')
    });
  });

  let roomsDetail = Array.from(roomData.values());
  roomsDetail.sort(byProperty('sortKey'));
  
  let roomsDetailLength = roomsDetail.length;
  for (let i = 0; i < roomsDetailLength; i++) {
    // sort all sessions in each day by 'venue + date'
    roomsDetail[i].sessions.sort(byProperty('sortKey'));

    // remove venue names from all but the 1st session in each venue
    let sessionsLength = roomsDetail[i].sessions.length;
    let prevVenue = '';
    for (let j = 0; j < sessionsLength; j++) {
      if (roomsDetail[i].sessions[j].venue == prevVenue) {
        roomsDetail[i].sessions[j].venue = '';
      } else {
        prevVenue = roomsDetail[i].sessions[j].venue; 
      }
    }
  }

  return roomsDetail;
}

function getAppName(event) {
    const name = event.name;
    return name;
}

function getOrganizerName(event) {
    const name = event.organizer_name;
    return name;
}

function foldBySpeakers(speakers ,sessions, tracksData, reqOpts, next) {
  if (reqOpts.assetmode === 'download') {
    const appFolder = reqOpts.email + '/' + slugify(reqOpts.name);
    async.eachOfSeries(speakers, (speaker, key, callback) => {

      if (speaker.photo !== null && speaker.photo != '') {
        if (speaker.photo.substring(0, 4) === 'http') {
          distHelper.downloadSpeakerPhoto(appFolder, speaker.photo, function(result){
            speakers[key].photo = encodeURI(result);
            callback();
          });
        }
        else if (reqOpts.datasource === 'eventapi' ) {
          distHelper.downloadSpeakerPhoto(appFolder, urljoin(reqOpts.apiendpoint, speaker.photo), function(result){
            speakers[key].photo = encodeURI(result);
            callback();
          });
        } else {
          var reg = speaker.photo.split('');
          if(reg[0] =='/'){
            speakers[key].photo = encodeURI(speaker.photo.substring(1,speaker.photo.length));
            callback();
          }
        }
      } else {
        callback();
      }
    }, function(){
        let speakerslist = [];
        speakers.forEach((speaker) => {
          if(speaker.photo){
            var thumb = 'images/speakers/thumbnails/' + (speaker.photo).split('/').pop();
          }
          speakerslist.push({
            country: speaker.country,
            featured: speaker.featured,
            email: speaker.email,
            facebook: speaker.facebook ,
            github: speaker.github ,
            linkedin: speaker.linkedin ,
            twitter: speaker.twitter ,
            website: speaker.website ,
            long_biography: speaker.long_biography ,
            mobile: speaker.mobile,
            name: speaker.name,
            thumb: thumb,
            photo: speaker.photo,
            organisation: speaker.organisation,
            sessions : getAllSessions(speaker.sessions, sessions, tracksData),
            speaker_id: speaker.id,
            nameIdSlug: slugify(speaker.name + speaker.id)
          });
        speakerslist.sort(byProperty('name'));
      });
        next(speakerslist);
      });
  }
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
       sessiondetail.push({
        detail :sessionsMap.get(speaker.id)
      })
      }
  })
sessiondetail.forEach((session) => {

  const roomname = (session.detail == null || session.detail.microlocation == null) ?' ': session.detail.microlocation.name;
  if(session.detail !== undefined ) {
    speakersession.push({

      start: moment.utc(session.detail.start_time).local().format('HH:mm'),
      end:   moment.utc(session.detail.end_time).local().format('HH:mm'),
      title: session.detail.title,
      date: moment.utc(session.detail.start_time).local().format('ddd, Do MMM'),
      color: returnTrackColor(trackDetails, (session.detail.track == null) ? null : session.detail.track.id),
      microlocation: roomname,
      session_id: session.detail.id
   });
  }

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
module.exports.getOrganizerName = getOrganizerName;
module.exports.foldBySpeakers = foldBySpeakers;
module.exports.foldByTime = foldByTime;
module.exports.returnTracknames = returnTracknames;
