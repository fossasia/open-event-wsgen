'use strict';

const moment = require('moment');
const distHelper = require('./dist');
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
    return '#f8f8fa'
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
    const roomName = (session.microlocation == null) ? ' ' : session.microlocation.name;
    const session_type = (session.session_type == null) ? ' ' : session.session_type.name ;
    const slug = date + '-' + slugify(trackName);
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug) && (session.track != null)) {
      track = {
        title: session.track.name,
        color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
        date: moment(session.start_time).format('dddd, Do MMM'),
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
      start: moment(session.start_time).utcOffset(4).format('HH:mm'),
      end : moment(session.end_time).utcOffset(4).format('HH:mm'),
      title: session.title,
      type: session_type,
      location: roomName,
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
    let date = moment(session.start_time).format('YYYY-MM-DD');
    let time = moment(session.start_time).utcOffset(4).format('HH:mm');
    let speakersNum = session.speakers.length;

    console.log(date);
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        slug: date,
        date: moment(session.start_time).utcOffset(4).format('dddd, Do MMM'),
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
      start: moment(session.start_time).utcOffset(4).format('HH:mm'),
      end : moment(session.end_time).utcOffset(4).format('HH:mm'),
      color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
      title: session.title,
      type: session_type,
      location: roomName,
      speakers_list: session.speakers.map((speaker) => speakersMap.get(speaker.id)),
      description: session.long_abstract,
      session_id: session.id,
      sign_up: session.signup_url,
      video: session.video,
      slides: session.slides,
      audio: session.audio,
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

function extractEventUrls(event, speakers, sponsors, reqOpts) {
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
    date: moment(event.start_time).format('dddd, Do MMM'),
    time: moment(event.start_time).format('HH:mm'),
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
        urls.logo_url = distHelper.downloadLogo(appFolder, event.logo);
      } else if (reqOpts.datasource === 'eventapi') {
        if (event.logo.charAt(0) == '/') event.logo = event.logo.substr(1);
        urls.logo_url = encodeURI(distHelper.downloadLogo(appFolder, urljoin(reqOpts.apiendpoint, event.logo)));
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
        urls.background_url = distHelper.downloadLogo(appFolder, event.background_image);
      } else if (reqOpts.datasource === 'eventapi') {
        if (event.background_image.charAt(0) == '/') event.background_image = event.background_image.substr(1);
        urls.background_url = encodeURI(distHelper.downloadLogo(appFolder, urljoin(reqOpts.apiendpoint, event.background_image)));
      }
      else {
        let reg = event.background_image.split('');
        if(reg[0] =='/'){
          urls.background_url = encodeURI(event.background_image.substring(1,event.background_image.length));
        }
      }
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
        sponsor.logo = encodeURI(distHelper.downloadSponsorPhoto(appFolder, sponsor.logo));
      } else if (reqOpts.datasource === 'eventapi' ) {
        sponsor.logo = encodeURI(distHelper.downloadSponsorPhoto(appFolder, urljoin(reqOpts.apiendpoint, sponsor.logo)));

      }
      else {
      let reg = sponsor.logo.split('');
      if(reg[0] =='/'){
          sponsor.logo = encodeURI(sponsor.logo.substring(1,sponsor.logo.length));
        }

      }
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
    const date = moment(session.start_time).format('YYYY-MM-DD');
    const roomName = (session.microlocation == null) ? ' ' : session.microlocation.name;
    const slug = date ;
    const tracktitle = (session.track == null) ? " " : session.track.name;
    let room = null;

    // set up room if it does not exist
    if (!roomData.has(slug) && (session.microlocation != null)) {
      room = {
        date: moment(session.start_time).utcOffset(4).format('dddd, Do MMM'),
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
    if(session.microlocation !== null ) {
     const slug2 = date + '-' + session.microlocation.name ;
    if(microlocationArray.indexOf(slug2) == -1 ) {
      microlocationArray.push(slug2);
      var venue = session.microlocation.name;
    }
  }
    else {
      venue = "";
    }

   
    room.sessions.push({
      start: moment(session.start_time).utcOffset(4).format('HH:mm'),
      color: returnTrackColor(trackDetails, (session.track == null) ? null : session.track.id),
      venue: venue,
      end : moment(session.end_time).utcOffset(4).format('HH:mm'),
      title: session.title,
      description: session.long_abstract,
      session_id: session.id,
      speakers_list: session.speakers.map((speaker) => speakersMap.get(speaker.id)),
      tracktitle: tracktitle,
      sessiondate: moment(session.start_time).format('dddd, Do MMM'),
      roomname: roomName

    });



  });

  let roomsDetail = Array.from(roomData.values());

  roomsDetail.sort(byProperty('date'));

  return roomsDetail;
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
          speaker.photo = encodeURI(distHelper.downloadSpeakerPhoto(appFolder, speaker.photo));
        }
        else  if (reqOpts.datasource === 'eventapi' ) {
          speaker.photo = encodeURI(distHelper.downloadSpeakerPhoto(appFolder, urljoin(reqOpts.apiendpoint, speaker.photo)))
        } else {
        var reg = speaker.photo.split('');
        if(reg[0] =='/'){
          speaker.photo = encodeURI(speaker.photo.substring(1,speaker.photo.length));
        }
      }

      }
    });
  }

  let speakerslist = [];
  speakers.forEach((speaker) => {
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
      photo : speaker.photo,
      organisation: speaker.organisation,
      sessions : getAllSessions(speaker.sessions, sessions, tracksData),
      speaker_id: speaker.id
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
       sessiondetail.push({
        detail :sessionsMap.get(speaker.id)
      })
      }
  })
sessiondetail.forEach((session) => {
  const roomname = (session.detail == null) ?' ': session.detail.microlocation.name;
  speakersession.push({
      start: moment(session.detail.start_time).utcOffset(4).format('HH:mm'),
      end:   moment(session.detail.end_time).utcOffset(4).format('HH:mm'),
      title: session.detail.title,
      date: moment(session.detail.start_time).format('ddd, Do MMM'),
      color: returnTrackColor(trackDetails, (session.detail.track == null) ? null : session.detail.track.id),
      microlocation: roomname,
      session_id: session.detail.id
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
module.exports.foldByTime = foldByTime;
