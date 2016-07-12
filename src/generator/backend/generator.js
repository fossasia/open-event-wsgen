'use strict';

var exports = module.exports = {};

const fs = require('fs-extra');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');
const sass = require('node-sass');
const jsonfile = require('jsonfile');

const distHelper = require(__dirname + '/dist.js');
const fold = require(__dirname + '/fold.js');

const navbar = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/navbar.hbs').toString('utf-8'));
const footer = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/footer.hbs').toString('utf-8'));

handlebars.registerPartial('navbar', navbar);
handlebars.registerPartial('footer', footer);

const tpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/schedule.hbs').toString('utf-8'));
const trackstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/tracks.hbs').toString('utf-8'));
const roomstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/rooms.hbs').toString('utf-8'));
const speakerstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/speakers.hbs').toString('utf-8'));

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

function transformData(sessions, speakers, event, sponsors, tracksData, roomsData, reqOpts) {
  const tracks = fold.foldByTrack(sessions, speakers, tracksData, reqOpts);
  const days = fold.foldByDate(tracks);
  const sociallinks = fold.createSocialLinks(event);
  const eventurls = fold.extractEventUrls(event, reqOpts);
  const copyright = fold.getCopyrightData(event);
  const sponsorpics = fold.foldByLevel(sponsors);
  const roomsinfo  =  fold.foldByRooms(roomsData, sessions, tracksData);
  const apptitle = fold.getAppName(event);

  return {tracks, days, sociallinks, eventurls, copyright, sponsorpics, roomsinfo, apptitle};
}

function getJsonData(reqOpts) {
  const sessionsData = jsonfile.readFileSync(distJsonsPath + '/sessions');
  const speakersData = jsonfile.readFileSync(distJsonsPath + '/speakers');
  const eventData = jsonfile.readFileSync(distJsonsPath + '/event');
  const sponsorsData = jsonfile.readFileSync(distJsonsPath + '/sponsors');
  const tracksData   = jsonfile.readFileSync(distJsonsPath + '/tracks');
  const roomsData    = jsonfile.readFileSync(distJsonsPath + '/microlocations');

  const data = transformData(sessionsData, speakersData, eventData,
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
        case 'eventapi':
          console.log('================================FETCHING JSONS\n\n\n\n');
          distHelper.fetchApiJsons(req.body.apiendpoint, () => {
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
