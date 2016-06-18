'use strict';

var exports = module.exports = {};

const fs = require('fs-extra');
const moment = require('moment');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');
const sass = require('node-sass');

const distHelper = require(__dirname + '/dist.js');
const fold = require(__dirname +'/fold.js');

const tpl = handlebars.compile(fs.readFileSync(__dirname + '/schedule.tpl').toString('utf-8'));
const trackstpl = handlebars.compile(fs.readFileSync(__dirname + '/tracks.tpl').toString('utf-8'));

const distJsonsPath = distHelper.distPath + '/json';
// console.log(trackstpl(getJsonData()));


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

function transformData(sessions, speakers, services, sponsors,tracksData) {
  const tracks = fold.foldByTrack(sessions.sessions, speakers.speakers, tracksData.tracks);
  const days = fold.foldByDate(tracks);
  const sociallinks = fold.createSocialLinks(services);
  const eventurls = fold.extractEventUrls(services);
  const copyright = fold.getCopyrightData(services);
  const sponsorpics = fold.foldByLevel(sponsors.sponsors);

  return {tracks, days, sociallinks, eventurls, copyright, sponsorpics};
}

function getJsonData() {
  const sessionsData = require(distJsonsPath + '/sessions.json');
  const speakersData = require(distJsonsPath + '/speakers.json');
  const servicesData = require(distJsonsPath + '/event.json');
  const sponsorsData = require(distJsonsPath + '/sponsors.json');
  const tracksData =   require(distJsonsPath + '/tracks.json');

  const data = transformData(sessionsData, speakersData, servicesData, sponsorsData,tracksData);

  return data;
}

exports.createDistDir = function(req, callback) {
  console.log(req.files);
  console.log(req.body);
  const theme = req.body.theme;

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
      console.log('================================COPYING JSONS\n\n\n\n');
      switch (req.body.datasource) {
        case 'jsonupload':
          distHelper.copyUploads(req.files);
          distHelper.cleanUploads((cleanErr) => {
            console.log('================================CLEANING UPLOADS\n\n\n\n');
            if (cleanErr !== null) {
              console.log(cleanErr);
            }
            done(null, 'cleanuploads');
          });
          break;
        case 'mockjson':
        default:
          distHelper.copyMockJsons();
          done(null, 'cleanuploads');
          break;

      }
    },
    (done) => {
      console.log('===============================COMPILING SASS\n\n\n\n');

      sass.render({
        file: __dirname + '/_scss/_themes/_' + theme + '-theme/_' + theme + '.scss',
        outFile: distHelper.distPath + '/css/schedule.css'
      }, function(err, result) {
        if (!err) {
          fs.writeFile(distHelper.distPath + '/css/schedule.css', result.css, (writeErr) => {
            if (writeErr !== null) {
              console.log(writeErr);
            }
            done(null, 'sass');
          });
        } else {
          console.log(err);
        }
      });
    },
    (done) => {
      console.log('================================WRITING\n\n\n\n');

      fs.writeFileSync(distHelper.distPath + '/index.html', tpl(getJsonData()));
      fs.writeFileSync(distHelper.distPath + '/tracks.html', trackstpl(getJsonData()));
      callback();
      done(null, 'write');
    }
  ]);
};

exports.showLivePreview = function(res) {
  console.log('===============================LIVERENDER\n\n\n\n');

  res.redirect('/live/preview');
};

exports.pipeZipToRes = function(res) {
  console.log('================================ZIPPING\n\n\n\n');
  const zipfile = archiver('zip');

  zipfile.on('error', (err) => {
    throw err;
  });
  res.setHeader('Content-Type', 'application/zip');

  zipfile.pipe(res);

  zipfile.directory(distHelper.distPath, '/').finalize();
};
