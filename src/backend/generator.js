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
const mailer = require('./mailer');
const ftpDeployer = require('./ftpdeploy');

const navbar = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/navbar.hbs').toString('utf-8'));
const footer = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/footer.hbs').toString('utf-8'));

handlebars.registerPartial('navbar', navbar);
handlebars.registerPartial('footer', footer);

const tpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/schedule.hbs').toString('utf-8'));
// const trackstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/tracks.hbs').toString('utf-8'));
const roomstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/rooms.hbs').toString('utf-8'));
const speakerstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/speakers.hbs').toString('utf-8'));
const eventtpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/event.hbs').toString('utf-8'));

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
  const sponsorpics = fold.foldByLevel(sponsors, reqOpts);
  const roomsinfo  =  fold.foldByRooms(roomsData, sessions, tracksData);
  const speakerslist = fold.foldBySpeakers(speakers, sessions, tracksData, reqOpts);
  const apptitle = fold.getAppName(event);

  return {tracks, days, sociallinks, eventurls, copyright, sponsorpics, roomsinfo, apptitle, speakerslist};
}

function getJsonData(reqOpts) {
  const appFolder = reqOpts.email + '/' + fold.slugify(reqOpts.name);
  const distJsonsPath = distHelper.distPath + '/' + appFolder + '/json';

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

exports.uploadJsonZip = function(fileData, socket) {
  console.log('upload');
  distHelper.makeUploadsDir();
  distHelper.cleanUploads();
  distHelper.uploadWithProgress(fileData.singlefileUpload, fileData.zipLength, socket)

};

exports.createDistDir = function(req, socket, callback) {
  console.log(req.body);
  const theme = req.body.theme || 'light';
  const appFolder = req.body.email + '/' + fold.slugify(req.body.name);
  let emit = false;

  if (socket.constructor.name == 'Socket') {
    emit = true;
  }

  async.series([
    (done) => {
        if (emit) socket.emit('live.process', {donePercent: 10, status: "Cleaning dist folder"});
      distHelper.cleanDist(appFolder, (cleanerr) => {
        console.log('================================CLEANING\n');
        if (cleanerr !== null) {
            console.log(cleanerr);
            return socket.emit('live.error', {status: "Error in cleaning dist folder"} );
        }
          done(null, 'clean');
      });
    },
    (done) => {
      console.log('================================MAKING\n');
      if (emit)socket.emit('live.process', {donePercent: 20, status: "Making dist folder"});
      distHelper.makeDistDir(appFolder);
      done(null, 'make');
    },
    (done) => {
      if (emit)socket.emit('live.process', {donePercent: 30, status: "Copying assets"});
      distHelper.copyAssets(appFolder, (copyerr) => {
        console.log('================================COPYING\n');

        if (copyerr !== null) {
          console.log(copyerr);
          return  socket.emit('live.error', {donePercent: 40, status: "Error in Copying assets"} );
        }
        done(null, 'copy');
      });
    },
    (done) => {
      console.log('================================COPYING JSONS\n');
      if (emit)socket.emit('live.process', {donePercent: 50, status: "Copying the JSONs"});
      switch (req.body.datasource) {
        case 'jsonupload':
          distHelper.copyUploads(appFolder, req.body.singlefileUpload);
          done(null, 'cleanuploads');
          break;
        case 'eventapi':
          console.log('================================FETCHING JSONS\n');
          distHelper.fetchApiJsons(appFolder, req.body.apiendpoint, () => {
            done(null, 'cleanuploads');
          });
          break;
        case 'mockjson':
        default:
          distHelper.copyMockJsons(appFolder);
          done(null, 'cleanuploads');
          break;

      }
    },
    (done) => {
      console.log('===============================COMPILING SASS\n');
      if (emit) socket.emit('live.process', {donePercent: 60, status: "Compiling the SASS files"});
      sass.render({
        file: __dirname + '/_scss/_themes/_' + theme + '-theme/_' + theme + '.scss',
        outFile: distHelper.distPath + '/' + appFolder + '/css/schedule.css'
      }, function(err, result) {
        if (!err) {
          fs.writeFile(distHelper.distPath + '/' + appFolder +  '/css/schedule.css', result.css, (writeErr) => {
            if (writeErr !== null) {
              console.log(writeErr);
                return socket.emit('live.error' , {status : "Error in Writing css file" });
            }
            done(null, 'sass');
          });
        } else {
          console.log(err);
          if (emit) socket.emit('live.error', {status: "Error in Compiling SASS"} );
        }
      });
    },
    (done) => {
      console.log('================================WRITING\n');
      if (emit)socket.emit('live.process', {donePercent: 70, status: "Compiling the HTML pages from templates"});
      const jsonData = getJsonData(req.body);

      try {

          fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/tracks.html', tpl(jsonData));
          // fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/tracks.html', trackstpl(jsonData));
          fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/rooms.html', roomstpl(jsonData));
          fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/speakers.html', speakerstpl(jsonData));
          fs.writeFileSync(distHelper.distPath + '/' + appFolder +  '/index.html', eventtpl(jsonData));
      } catch (err)
      {
          console.log(err);
        if (emit)socket.emit('live.error' , {status : "Error in Compiling/Writing templates"} );
      }

      done(null, 'write');
    },
    (done) => {
      console.log('=================================SENDING MAIL\n');
      if (emit) socket.emit('live.process', {donePercent: 80, status: "Website is being generated"});
      
      if (req.body.ftpdetails) {
        setTimeout(()=>{
          ftpDeployer.deploy(req.body.ftpdetails, appFolder, () => {
            //Send call back to orga server
          })
        }, 30000);
      }
      
      mailer.sendMail(req.body.email, fold.slugify(req.body.name), () => {
        callback(appFolder);
        done(null, 'write');
      });
      
    }
  ]);
};


exports.pipeZipToRes = function(email, appName, res) {
  const appFolder = email + '/' + appName;
  console.log('================================ZIPPING\n');
  const zipfile = archiver('zip');

  zipfile.on('error', (err) => {
    throw err;
  });
  res.setHeader('Content-Type', 'application/zip');

  zipfile.pipe(res);

  zipfile.directory(distHelper.distPath + '/' + appFolder, '/').finalize();
};
