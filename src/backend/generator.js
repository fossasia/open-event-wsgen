'use strict';

var exports = module.exports = {};
var logger = require('./buildlogger.js');
var gulp = require('./gulpfile.js');
var hasher = require('folder-hash');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');
const sass = require('node-sass');
const jsonfile = require('jsonfile');
const minify = require('html-minifier').minify;
const distHelper = require(__dirname + '/dist.js');
const fold = require(__dirname + '/fold.js');
const mailer = require('./mailer');
const ftpDeployer = require('./ftpdeploy');

const navbar = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/navbar.hbs').toString('utf-8'));
const footer = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/footer.hbs').toString('utf-8'));
const scroll = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/scroll.hbs').toString('utf-8'));
const social = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/social.hbs').toString('utf-8'));
const tracklist = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/tracklist.hbs').toString('utf-8'));
const roomlist = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/roomlist.hbs').toString('utf-8'));

handlebars.registerPartial('navbar', navbar);
handlebars.registerPartial('footer', footer);
handlebars.registerPartial('scroll', scroll);
handlebars.registerPartial('social', social);
handlebars.registerPartial('tracklist', tracklist);
handlebars.registerPartial('roomlist', roomlist);

const tracksTpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/tracks.hbs').toString('utf-8'));
const scheduleTpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/schedule.hbs').toString('utf-8'));
const roomstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/rooms.hbs').toString('utf-8'));
const speakerstpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/speakers.hbs').toString('utf-8'));
const eventtpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/event.hbs').toString('utf-8'));
const sessiontpl = handlebars.compile(fs.readFileSync(__dirname + '/templates/session.hbs').toString('utf-8'));

if (!String.linkify) {
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

handlebars.registerHelper('ifvalue', function (conditional, options) {
  if (conditional !== options.hash.notequals){
    return options.fn(this);
  }
  else{
    return options.inverse(this);
  }
});

handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

function minifyHtml(file) {
  var result = minify(file, {
    removeAttributeQuotes: true,
    minifyCSS: true,
    minifyJS: true,
    minifyURLs: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  });
  return result;
}

function transformData(sessions, speakers, event, sponsors, tracksData, roomsData, reqOpts, next) {
  fold.foldByTrack(sessions, speakers, tracksData, reqOpts, function(tracks) {
    const days = fold.foldByDate(tracks);
    const sociallinks = fold.createSocialLinks(event);
    fold.extractEventUrls(event, speakers, sponsors, reqOpts, function(eventurls){
      const copyright = fold.getCopyrightData(event);
      fold.foldByLevel(sponsors, reqOpts, function(sponsorpics){
        const roomsinfo = fold.foldByRooms(roomsData, sessions, speakers, tracksData);
        fold.foldBySpeakers(speakers, sessions, tracksData, reqOpts, function(speakerslist){
          const apptitle = fold.getAppName(event);
          const timeList = fold.foldByTime(sessions, speakers, tracksData);
          const metaauthor = fold.getOrganizerName(event);
          const tracknames = fold.returnTracknames(sessions, tracksData);
          const roomsnames = fold.returnRoomnames(roomsinfo);
          next({
            tracks, days, sociallinks,
            eventurls, copyright, sponsorpics,
            roomsinfo, apptitle, speakerslist, timeList, metaauthor, tracknames, roomsnames
          });
        });

      });
    });
  });
}

function getJsonData(reqOpts, next) {
  try {
    const appFolder = reqOpts.email + '/' + fold.slugify(reqOpts.name);
    const distJsonsPath = distHelper.distPath + '/' + appFolder + '/json';
    const sessionsData = jsonfile.readFileSync(distJsonsPath + '/sessions');
    const speakersData = jsonfile.readFileSync(distJsonsPath + '/speakers');
    const eventData = jsonfile.readFileSync(distJsonsPath + '/event');
    const sponsorsData = jsonfile.readFileSync(distJsonsPath + '/sponsors');
    const tracksData = jsonfile.readFileSync(distJsonsPath + '/tracks');
    const roomsData = jsonfile.readFileSync(distJsonsPath + '/microlocations');

    return transformData(sessionsData, speakersData, eventData, sponsorsData, tracksData, roomsData, reqOpts, function(data) {
      next(null, data);
    });
  } catch (err) {
    return next(err);
  }
}

exports.stopBuild = function(socket){
  if (statusMap[socket.connId]) {
    statusMap[socket.connId] = false;
  }
  else{
    socket.emit('Cancel_Build');
  }
}

exports.enableBuild = function(socket){
  statusMap[socket.connId] = true;
}

exports.uploadJsonZip = function(fileData, socket) {
  distHelper.uploadWithProgress(fileData.singlefileUpload, fileData.zipLength, socket)
};
exports.finishZipUpload = function(file, id) {
  console.log('=============================ZIP SAVED\n');
  console.log(file.base);
  console.log(file.pathName);
  distHelper.moveZip(file.pathName, id);

};

exports.startZipUpload = function(id) {
  console.log('========================ZIP UPLOAD START\n\n');
  distHelper.makeUploadsDir(id);
  distHelper.cleanUploads(id);
};

exports.createDistDir = function(req, socket, callback) {
  console.log(req.body);
  // since we don't give the name of the app, we use a dummy value 'tempProject' in place of it
  req.body.name = 'tempProject' + socket.connId;  // temporary name for the project till the time we get the actual name of the event
  const theme = req.body.theme || 'light' ;
  const mode = req.body.sessionMode;
  var appFolder = req.body.email + '/' + fold.slugify(req.body.name);
  let emit = false;

  if (socket.constructor.name == 'Socket') {
    emit = true;
  }
  // the below variable will store the actual name of the event
  var eventName;

  async.series([
    (done) => {
      console.log('================================CLEANING TEMPORARY FOLDERS\n');
      logger.addLog('Info', 'Cleaning up the previously existing temporary folders', socket);
      if (emit) socket.emit('live.process', {donePercent: 5, status: "Cleaning temporary folder"});
      fs.remove(distHelper.distPath + '/' + appFolder, (err) => {
        if(err !== null) {
          logger.addLog('Error', 'Failed to clean up the previously existing temporary folders', socket, err);
          console.log(err);
        }
        logger.addLog('Success', 'Successfully cleaned up the temporary folders', socket);
        done(null, 'clean');
      });
    },
    (done) => {
      console.log('================================MAKING\n');
      logger.addLog('Info', 'Making the dist folder', socket);
      if (emit) socket.emit('live.process', {donePercent: 10, status: "Making dist folder" });
      distHelper.makeDistDir(appFolder, socket);
      done(null, 'make');
    },
    (done) => {
      if (emit) socket.emit('live.process', { donePercent: 20, status: "Copying assets" });
      logger.addLog('Info', 'Copying Assets', socket);
      distHelper.copyAssets(appFolder, (copyerr) => {
        console.log('================================COPYING\n');

        if (copyerr !== null) {
          console.log(copyerr);
          logger.addLog('Error', 'Error occured while copying assets into the appFolder', socket, copyerr);
          return socket.emit('live.error', {donePercent: 30, status: "Error in Copying assets" });
        }
        logger.addLog('Success', 'Assets were successfully copied', socket);
        done(null, 'copy');
      });
    },
    (done) => {
      if (emit) socket.emit('live.process', { donePercent: 40, status: "Cleaning dependencies folder" });
      logger.addLog('Info', 'Cleaning dependencies folder created as a part of copying assets inside the appFolder', socket);
      distHelper.removeDependency(appFolder, socket, (copyerr) => {
        console.log('============================Moving contents from dependency folder and deleting the dependency folder');
        if (copyerr !== null) {
          logger.addLog('Error', 'Error while reading directory', socket, copyerr);
          console.log(copyerr);
          return socket.emit('live.error', {donePercent: 45, status: "Error in moving files from dependency folder" });
        }
        return gulp.minifyJs(distHelper.distPath + '/' + appFolder, function() {
          logger.addLog('Success', 'Dependencies folder cleaned successfully', socket);
          return done(null, 'move');
        })
      });
    },
    (done) => {
      console.log('================================COPYING JSONS\n');
      logger.addLog('Info', 'Copying Jsons', socket);
      if (emit) socket.emit('live.process', {donePercent: 50, status: "Copying the JSONs" });
      switch (req.body.datasource) {
        case 'jsonupload':
          logger.addLog('Info','Jsons have been uploaded by the user', socket);
          distHelper.copyUploads(appFolder, socket, function(err) {
            if(err) {
              console.log(err);
              done(err);
            }
            done(null, 'copyUploads');
          });
          break;
        case 'eventapi':
          console.log('================================FETCHING JSONS\n');
          logger.addLog('Info', 'Fetching Jsons from the internet', socket);
          distHelper.fetchApiJsons(appFolder, req.body.apiendpoint, socket, (err) => {
            if(err !== null) {
              console.log(err);
              return done(err);
            }
            logger.addLog('Success', 'All jsons have been successfully downloaded', socket);
            done(null, 'fetchApiJsons');
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
      if (emit) socket.emit('live.process', {donePercent: 60, status: "Compiling the SASS files" });
      sass.render({
        file: __dirname + '/_scss/_themes/_' + theme + '-theme/_' + theme + '.scss',
        outFile: distHelper.distPath + '/' + appFolder + '/css/schedule.css'
      }, function(err, result) {
        if (!err) {
          logger.addLog('Success', 'SASS file compiled successfully', socket);
          fs.writeFile(distHelper.distPath + '/' + appFolder + '/css/schedule.css', result.css, (writeErr) => {
            if (writeErr !== null) {
              logger.addLog('Error', 'Error in writing css file', socket, writeErr);
              console.log(writeErr);
              return socket.emit('live.error', { status: "Error in Writing css file" });
            }
            return gulp.minifyCss(distHelper.distPath + '/' + appFolder, function () {
              logger.addLog('Success', 'css file was written successfully', socket);
              return done(null, 'sass');
            });
          });
        }
        else {
          logger.addLog('Error', 'Error in compiling SASS', socket, err);
          console.log(err);
          if (emit) socket.emit('live.error', { status: "Error in Compiling SASS" });
        }
      });
    },
    (done) => {
      logger.addLog('Info', 'Extracting data from the uploaded jsons', socket);
      console.log('================================WRITING\n');
      if (emit) socket.emit('live.process', {donePercent: 70, status: "Compiling the HTML pages from templates" });

      getJsonData(req.body, function(error, data) {
        if (error) {
          console.log('Error Invalid Zip');
          logger.addLog('Error', 'Invalid Zip', socket, error);
          if (emit) {
            socket.emit('live.error', {status: 'Error in read contents of zip'});
          }
          return done(error);
        }

        logger.addLog('Success', 'Json data extracted', socket);
        logger.addLog('Info', 'Name of the event found from the event json file', socket);
        logger.addLog('Info', 'Compiling the html pages from the templates', socket);

        const jsonData = data;

        eventName = fold.removeSpace(jsonData.eventurls.name);
        var backPath = distHelper.distPath + '/' + appFolder + '/' + jsonData.eventurls.background_path;
        var basePath = distHelper.distPath + '/' + appFolder + '/images';
        var logoPath = distHelper.distPath + '/' + appFolder + '/' + jsonData.eventurls.logo_url;
        distHelper.optimizeBackground(backPath, socket, function() {
          if(jsonData.eventurls.logo_url) {
            distHelper.optimizeLogo(logoPath, socket, function (err, pad) {
              if (err) {
                console.log(err);
                return done(err);
              }
              jsonData.navpad = pad;
            });
          }
          distHelper.resizeSponsors(basePath, socket, function() {
            distHelper.resizeSpeakers(basePath, socket, function() {
              templateGenerate();
            });
          });
        });

        function templateGenerate() {
          try {

            if(mode == 'single') {
              logger.addLog('Info', 'Generating Single Page for each session', socket);

              function checkLinks() {

                function changeEventUrlLinks() {
                  data.eventurls.logo_url = '../' + jsonData.eventurls.logo_url;
                  data.eventurls.name = '../' + jsonData.eventurls.name;
                }

                if(jsonData.tracks !== undefined)
                  data.tracks = true;
                if(jsonData.roomsinfo !== undefined)
                  data.roomsinfo = true;
                if(jsonData.speakerslist !== undefined)
                  data.speakerslist = true;
                if(jsonData.timeList !== undefined)
                  data.timeList = true;

                data.eventurls = JSON.parse(JSON.stringify(jsonData.eventurls));
                data.sociallinks = jsonData.sociallinks;
                data.copyright = jsonData.copyright;

                changeEventUrlLinks();
              }

              jsonData.mode = mode;
              var trackArr = jsonData.tracks;
              for(var i = 0; i < trackArr.length; i++) {
                var sessionArr = trackArr[i].sessions;

                for(var j = 0; j < sessionArr.length; j++) {
                  var sessionObj = JSON.parse(JSON.stringify(sessionArr[j]));
                  var sessionId = sessionObj.session_id;
                  var speakerList = sessionObj.speakers_list;

                  sessionObj.color = trackArr[i].color;
                  sessionObj.font_color = trackArr[i].font_color;
                  sessionObj.track_title = trackArr[i].title;
                  sessionObj.track_jump_link = '../tracks.html#' + trackArr[i].slug;
                  sessionObj.room_jump_link = '../rooms.html#' + sessionObj.startDate + '-' + fold.replaceSpaceWithUnderscore(sessionObj.location);

                  for(var k = 0; k < speakerList.length; k++) {
                    speakerList[k].thumb = '../' + speakerList[k].thumb;
                  }

                  var data = {session: sessionObj};
                  data.single_session = true;
                  checkLinks();
                  fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/sessions/session_' + sessionId + '.html', minifyHtml(sessiontpl(data)));

                }
              }
              logger.addLog('Success', 'Generated single page for each session', socket);
            }

            function setPageFlag(page) {
              jsonData.trackFlag = jsonData.scheduleFlag = jsonData.roomFlag = jsonData.indexFlag = jsonData.speakerFlag = 0;
              switch(page) {
                case 'track':
                  jsonData.trackFlag = 1;
                  break;
                case 'schedule':
                  jsonData.scheduleFlag = 1;
                  break;
                case 'room':
                  jsonData.roomFlag = 1;
                  break;
                case 'index':
                  jsonData.indexFlag = 1;
                  break;
                case 'speaker':
                  jsonData.speakerFlag = 1;
                  break;
              }
            }

            setPageFlag('track');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/tracks.html', minifyHtml(tracksTpl(jsonData)));

            setPageFlag('schedule');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/schedule.html', minifyHtml(scheduleTpl(jsonData)));

            setPageFlag('room');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/rooms.html', minifyHtml(roomstpl(jsonData)));

            setPageFlag('speaker');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/speakers.html', minifyHtml(speakerstpl(jsonData)));

            setPageFlag('index');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/index.html', minifyHtml(eventtpl(jsonData)));
          } catch (err) {
            console.log(err);
            logger.addLog('Error', 'Error in compiling/writing templates', socket, err);
            if (emit) {
              socket.emit('live.error', {status: 'Error in Compiling/Writing templates'});
            }
            return done(err);
          }
          return distHelper.generateThumbnails(distHelper.distPath + '/' + appFolder, function() {
            logger.addLog('Success', 'HTML pages were succesfully compiled from the templates', socket);
            return done(null, 'write');
          });
        }
      });
    },

    (done) => {
      logger.addLog('Info', 'Cleaning up remaining folder of the same name as that of the event', socket);
      console.log("============Cleaning up remaining folders of the same name\n");
      if (emit) socket.emit('live.process', {donePercent: 75, status: "Cleaning up folders of the same name" });

      distHelper.removeDuplicateEventFolders(eventName, req.body.email, socket, (remerr) => {
        if (remerr !== null) {
          logger.addLog('Error', 'Error occured while removing the duplicate event folders', socket, remerr);
          console.log(remerr);
          if (emit) socket.emit('live.error', {status: "Error in removing the duplicate event folders of the same name" });
        }
        return gulp.minifyHtml(distHelper.distPath + '/' + appFolder, function() {
          logger.addLog('Success', 'Duplicated events removed successfully', socket);
          return done(null, 'remove');
        });
      });

    },
    (done) => {
      logger.addLog('Info', 'Renaming temporary folder to the actual event folder', socket);
      console.log("============Renaming temporary folder to the actual event folder");
      if (emit) socket.emit('live.process', {donePercent: 80, status: "Generating the event folder" });

      const eventFolderSource = __dirname + '/../../dist/';

      fs.move(eventFolderSource + appFolder, eventFolderSource + req.body.email + '/' + eventName, (moveerr) => {
        if (moveerr !== null) {
          logger.addLog('Error', 'Error in moving files to the event folders', socket, moveerr);
          console.log(moveerr);
          if (emit) socket.emit('live.error', {status: "Error in moving files to the event directory" });
        }
        logger.addLog('Success', 'Changed the temporary name of the project to its actual name', socket);
        appFolder = req.body.email + '/' + eventName;
        done(null, 'move');

      });

    },
    (done) => {
      logger.addLog('Info', 'Calculating the hash of the event folder and copying the service worker file', socket);
      console.log('Calculating the hash of the event folder and copying the service worker file');
      if (emit) socket.emit('live.process', {donePercent: 85, status: "Copying Service Worker File"});

      hasher.hashElement(eventName, distHelper.distPath + '/' + req.body.email, function (err, hashObj) {
        if (err) {
          console.log(err);
          logger.addLog('Error', 'Error occured when calculating hash of event folder', socket, err);
          return done(err);
        }
        distHelper.copyServiceWorker(appFolder, hashObj['hash'], function (err) {
          if (err) {
            console.log(err);
            logger.addLog('Error', 'Error occured while copying service worker file', socket, err);
            return done(err);
          }
          return done(null);
        });
      });
    },

    (done) => {
        logger.addLog('Info', 'Copying the manifest file', socket);
        if (emit) socket.emit('live.process', {donePercent: 88, status: "Copying Manifest File"});

        distHelper.copyManifestFile(appFolder, eventName, function(err) {
          if (err) {
            console.log(err);
            logger.addLog('Error', 'Error occured while copying manifest file', socket, err);
            return done(err);
          }
          return done(null);
        });
    },

    (done) => {
      logger.addLog('Info', 'Creating zip file of the event', socket);
      console.log("==================================Creating zip file");
      if (emit) socket.emit('live.process', {donePercent:90, status: "Website is being generated"});
      var output = fs.createWriteStream(distHelper.distPath + '/' + req.body.email + '/event.zip');
      var archive = archiver('zip', {store: true});
      output.on('close', function() {
        logger.addLog('Success', 'Zip file has been created', socket);
        done(null, 'zip');
      });
      archive.on('error', function(err) {
        logger.addLog('Error', 'Error occured while zipping the file', socket, err)
      });
      archive.pipe(output);
      archive.directory(distHelper.distPath + '/' + appFolder, '/').finalize();
    },
    (done) => {
      logger.addLog('Info', 'Sending mail to the user', socket);
      console.log('=================================SENDING MAIL\n');
      if (emit) socket.emit('live.process', {donePercent: 95, status: "Website is being generated" });

      if (req.body.ftpdetails) {
        setTimeout(() => {
          ftpDeployer.deploy(req.body.ftpdetails, appFolder, () => {
            //Send call back to orga server
          })
        }, 30000);
      }

      mailer.uploadAndsendMail(req.body.email, eventName, socket, (obj) => {
        if(obj.mail)
          logger.addLog('Success', 'Mail sent succesfully', socket);
        else
          logger.addLog('Error', 'Error sending mail', socket);
        callback(appFolder, obj.url);
        done(null, 'write');
      });

      process.on('uncaughtException',function(err){
        if(err.code === 'ETIMEDOUT'){
          console.log('Failed to connect to address '+err.address);
          logger.addLog('Error','Failed to connect to address '+err.address,socket);
        }
        else{
          console.log(err);
        }
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


