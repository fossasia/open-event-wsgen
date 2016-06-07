'use strict'

var exports = module.exports = {};

const fs = require('fs');
const moment = require('moment');
const handlebars = require('handlebars');

const tpl = handlebars.compile(fs.readFileSync(__dirname + '/schedule.tpl').toString('utf-8'));
const sessionsData = require('../../../mockjson/sessions.json');
const speakersData = require('../../../mockjson/speakers.json');
const servicesData = require('../../../mockjson/event.json');
const sponsorsData = require('../../../mockjson/sponsors.json');

if(!String.linkify) {
  String.prototype.linkify = function() {
    var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;
    return this
            .replace(urlPattern, '<a href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
  };
}

handlebars.registerHelper('linkify', function(options) {
  var content = options.fn(this);
  return new handlebars.SafeString(content.linkify());
});

function slugify(str) {
  if (str === undefined) {
    return "";
  }
  return str.replace(/[^\w]/g, '-').replace(/-+/g, '-').toLowerCase();
}

function speakerNameWithOrg(speaker) {
  return speaker.organisation ?
    `${speaker.name} (${speaker.organisation})` :
    speaker.name
}

function foldByDate(tracks) {
  let dateMap = new Map();

  tracks.forEach((track) => {
    if (!dateMap.has(track.date)) {
      dateMap.set(track.date, {
        caption: track.date,
        tracks: []
      })
    }
    dateMap.get(track.date).tracks.push(track);
  })

  let dates = Array.from(dateMap.values())
  dates.forEach((date) => date.tracks.sort(byProperty('sortKey')))

  return dates;
}

function byProperty(key) {
  return (a, b) => {
    if (a[key] > b[key]) {
      return 1;
    }
    if (a[key] < b[key]) {
      return -1;
    } else {
      return 0;
    }
  }
}

function zeroFill(num) {
  if (num === undefined) {
    return ""
  }
  if (num >= 10) {
    return num.toString();
  } else {
    return '0' + num.toString();
  }
}

function foldByTrack(sessions, speakers) {
  let trackData = new Map()
  let speakersMap = new Map(speakers.map((s) => [s.id, s]));

  sessions.forEach((session) => {
    if (!session.start_time) {
      return
    }

    // generate slug/key for session
    let date = moment(session.start_time).format('YYYY-MM-DD');
    let slug = date + '-' + slugify(session.track.name);
    let track = null;

    // set up track if it does not exist
    if (!trackData.has(slug)) {
      track = {
        title: session.track.name,
        date: moment(session.start_time).locale('de').format('ddd D. MMM') + ' / ' + moment(session.start_time).format('ddd, Do MMM'),
        slug: slug,
        sortKey: date + '-' + zeroFill(session.track.order),
        sessions: []
      }
      trackData.set(slug, track);
    } else {
      track = trackData.get(slug);
    }

    track.sessions.push({
      start: moment(session.start_time).utcOffset(2).format('HH:mm'),
      title: session.title,
      type: session.type,
      location: session.location,
      speakers: session.speakers.map(speakerNameWithOrg).join(', '),
      speakers_list: session.speakers.map((speaker) => speakersMap.get(speaker.id)),
      description: session.description,
      session_id: session.session_id,
      sign_up: session.sign_up,
      video: session.video,
      slides: session.slides,
      audio: session.audio
    })
  });

  let tracks = Array.from(trackData.values())
  tracks.sort(byProperty('sortKey'))

  return tracks;
}

function getCopyrightData(services) {
  let copyright = services.copyright
  return copyright;
}

function foldByLevel(sponsors) {
  let levelData = {}

  sponsors.forEach((sponsor) => {
    if (levelData[sponsor.level] === undefined) {
      levelData[sponsor.level] = []
    }

    let sponsorItem = {
      divclass: '',
      imgsize: '',
      name: sponsor.name,
      image: sponsor.image,
      link: sponsor.link,
      level: sponsor.level,
      description: sponsor.description,
      type: sponsor.type
    }

    switch (sponsorItem.level) {
      case '1':
        sponsorItem.divclass = "largeoffset col-md-4"
        sponsorItem.imgsize = "large"
        break;
      case '2':
      default:
        sponsorItem.divclass = "mediumoffset col-md-2"
        sponsorItem.imgsize = "medium"
        break;
      case '3':
        sponsorItem.divclass = "largeoffset col-md-2"
        sponsorItem.imgsize = "small"
        break;
    }
    levelData[sponsor.level].push(sponsorItem)
  });
  return levelData;

}

function createSocialLinks(services) {
  let sociallinks = Array.from(services.services)
  sociallinks.forEach((link) => {
    link.show = true
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
  })
  return sociallinks;
}

function extractEventUrls(services) {
  let urls = services.logoico;

  return urls;
}

function transformData(sessions, speakers, services, sponsors) {
  let tracks = foldByTrack(sessions.sessions, speakers.speakers);
  let days = foldByDate(tracks);
  let sociallinks = createSocialLinks(services);
  let eventurls = extractEventUrls(services);
  let copyright = getCopyrightData(services);
  let sponsorpics = foldByLevel(sponsors.sponsors);
  return {tracks, days, sociallinks, eventurls, copyright, sponsorpics}
}

const data = transformData(sessionsData, speakersData, servicesData, sponsorsData)

exports.getSchedulePage = function () {
  return tpl(data);
}
