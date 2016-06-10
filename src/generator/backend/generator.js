'use strict';

var exports = module.exports = {};

const fs = require('fs-extra');
const moment = require('moment');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');

const distHelper = require(__dirname + '/dist.js');

const tpl = handlebars.compile(fs.readFileSync(__dirname + '/schedule.tpl').toString('utf-8'));

const distJsonsPath = distHelper.distPath + '/json';

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
  if (typeof str === 'undefined') {
    return '';
  }
  return str.replace(/[^\w]/g, '-').replace(/-+/g, '-').toLowerCase();
}

function speakerNameWithOrg(speaker) {
  return speaker.organisation ?
    `${speaker.name} (${speaker.organisation})` :
    speaker.name;
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

function zeroFill(num) {
  if (typeof num === 'undefined') {
    return '';
  }
  if (num >= 10) {
    return num.toString();
  }
  return '0' + num.toString();
}

function foldByTrack(sessions, speakers) {
  let trackData = new Map();
  let speakersMap = new Map(speakers.map((s) => [s.id, s]));

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
        date: moment(session.start_time).locale('de').format('ddd D. MMM') + ' / ' + moment(session.start_time).format('ddd, Do MMM'),
        slug: slug,
        sortKey: date + '-' + zeroFill(session.track.order),
        sessions: []
      };
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
    });
  });

  let tracks = Array.from(trackData.values());

  tracks.sort(byProperty('sortKey'));

  return tracks;
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

function transformData(sessions, speakers, services, sponsors) {
  const tracks = foldByTrack(sessions.sessions, speakers.speakers);
  const days = foldByDate(tracks);
  const sociallinks = createSocialLinks(services);
  const eventurls = extractEventUrls(services);
  const copyright = getCopyrightData(services);
  const sponsorpics = foldByLevel(sponsors.sponsors);

  return {tracks, days, sociallinks, eventurls, copyright, sponsorpics};
}

function getJsonData() {
  const sessionsData = require(distJsonsPath + '/sessions.json');
  const speakersData = require(distJsonsPath + '/speakers.json');
  const servicesData = require(distJsonsPath + '/event.json');
  const sponsorsData = require(distJsonsPath + '/sponsors.json');

  const data = transformData(sessionsData, speakersData, servicesData, sponsorsData);

  return data;
}

exports.pipeZipToRes = function(req, res) {
  async.series([
    (done) => {
      distHelper.cleanDist((cleanerr) => {
        console.log('================================CLEANING\n\n\n\n');
        if (cleanerr !== null) {
          console.log(cleanerr);
        }
        done(null, 'clean');
      });
    },
    (done) => {
      distHelper.makeDistDir((mkdirerr) => {
        console.log('================================MAKING\n\n\n\n');
        if (mkdirerr !== null) {
          console.log(mkdirerr);
        }
        done(null, 'make');
      });
    },
    (done) => {
      distHelper.copyAssets((copyerr) => {
        console.log('================================COPYING\n\n\n\n');
        if (copyerr !== null) {
          console.log(copyerr);
        }
        done(null, 'copy');
      });
    },
    (done) => {
      console.log('================================COPYING UPLOADS\n\n\n\n');
      distHelper.copyUploads(req.files);
      done(null, 'copyuploads');
    },
    (done) => {
      distHelper.cleanUploads((cleanErr) => {
        console.log('================================CLEANING UPLOADS\n\n\n\n');
        if (cleanErr !== null) {
          console.log(cleanErr);
        }
        done(null, 'cleanuploads');
      });
    },
    (done) => {
      console.log('================================WRITING\n\n\n\n');
      fs.writeFile(distHelper.distPath + '/index.html', tpl(getJsonData()), (writeErr) => {
        if (writeErr !== null) {
          console.log(writeErr);
        }
        done(null, 'write');
      });
    },
    (done) => {
      console.log('================================ZIPPING\n\n\n\n');
      const zipfile = archiver('zip');

      zipfile.on('error', (err) => {
        throw err;
      });

      zipfile.pipe(res);

      zipfile.directory(distHelper.distPath, '/').finalize();
      done(null, 'zip');
    }
  ]);
};
