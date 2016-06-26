'use strict';

var exports = module.exports = {};

const fs = require('fs-extra');
const moment = require('moment');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');
const sass = require('node-sass');
const jsonfile = require('jsonfile');

const distHelper = require(__dirname + '/dist.js');
const fold = require(__dirname + '/fold.js');

const tpl = handlebars.compile(fs.readFileSync(__dirname + '/schedule.tpl').toString('utf-8'));
const trackstpl = handlebars.compile(fs.readFileSync(__dirname + '/tracks.tpl').toString('utf-8'));
const roomstpl = handlebars.compile(fs.readFileSync(__dirname + '/rooms.tpl').toString('utf-8'));
const scheduletpl = handlebars.compile(fs.readFileSync(__dirname + '/schedule.tpl').toString('utf-8'));

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

function transformData(sessions, speakers, services, sponsors, tracksData, roomsData, reqOpts) {
  let tracks = fold.foldByTrack(sessions.sessions, speakers.speakers, tracksData.tracks, reqOpts);
  let days = fold.foldByDate(tracks);
  let sociallinks = fold.createSocialLinks(services);
  let eventurls = fold.extractEventUrls(services);
  let copyright = fold.getCopyrightData(services);
  let sponsorpics = fold.foldByLevel(sponsors.sponsors);
  let roomsinfo  =  fold.foldByRooms(roomsData, sessions.sessions);

  return {tracks, days, sociallinks, eventurls, copyright, sponsorpics, roomsinfo};
}

function getJsonData(reqOpts) {
  let sessionsData = jsonfile.readFileSync(distJsonsPath + '/sessions.json');
  let speakersData = jsonfile.readFileSync(distJsonsPath + '/speakers.json');
  let servicesData = jsonfile.readFileSync(distJsonsPath + '/event.json');
  let sponsorsData = jsonfile.readFileSync(distJsonsPath + '/sponsors.json');
  let tracksData   = jsonfile.readFileSync(distJsonsPath + '/tracks.json');
  let roomsData    = jsonfile.readFileSync(distJsonsPath + '/microlocations.json');

  let data = transformData(sessionsData, speakersData, servicesData,
      sponsorsData, tracksData, roomsData, reqOpts);

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
      console.log('================================MAKING\n\n\n\n');
      distHelper.makeDistDir();
      done(null, 'make');
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

      const jsonData = getJsonData(req.body);

      fs.writeFileSync(distHelper.distPath + '/index.html', tpl(jsonData));
      fs.writeFileSync(distHelper.distPath + '/tracks.html', trackstpl(jsonData));
      fs.writeFileSync(distHelper.distPath + '/rooms.html', roomstpl(jsonData));
      fs.writeFileSync(distHelper.distPath + '/speakers.html', speakerstpl(jsonData));

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
