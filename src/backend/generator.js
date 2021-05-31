/* eslint-disable no-empty-label */
'use strict';

// eslint-disable-next-line no-var
var exports = module.exports = {};
const logger = require('./buildlogger.js');
const gulp = require('./gulpfile.js');
const hasher = require('folder-hash');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const async = require('async');
const archiver = require('archiver');
const sass = require('node-sass');
const jsonfile = require('jsonfile');
const distHelper = require(__dirname + '/dist.js');
const mailer = require('./mailer');
const ftpDeployer = require('./ftpdeploy');
const app = require('../app');
const config = require('../../config.json');
const request = require('request').defaults({'proxy': config.proxy});
let fold;

function registerPartial(name) {
  const partial = handlebars.compile(fs.readFileSync(__dirname + '/templates/partials/' + name + '.hbs').toString('utf-8'));

  handlebars.registerPartial(name, partial);
}

function compileTemplate(name) {
  return handlebars.compile(fs.readFileSync(__dirname + '/templates/' + name + '.hbs').toString('utf-8'));
}

if (!String.linkify) {
  String.prototype.linkify = function() {
    const urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
    const pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    const emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

    return this
      .replace(urlPattern, '<a href="$&">$&</a>')
      .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
      .replace(emailAddressPattern, '<a href="mailto:$&">$&</a>');
  };
}

handlebars.registerHelper('linkify', function(options) {
  const content = options.fn(this);

  return new handlebars.SafeString(content.linkify());
});

handlebars.registerHelper('ifvalue', function(conditional, options) {
  if (conditional !== options.hash.notequals) {
    return options.fn(this);
  }

  return options.inverse(this);
});

handlebars.registerHelper('ifcontains', function(string, substring, options) {
  if (string && string.indexOf(substring) !== -1) {
    return options.fn(this);
  }

  return options.inverse(this);
});

handlebars.registerHelper('trimString', function(originalString) {
  const initials = originalString.substring(0, 1);

  return new handlebars.SafeString(initials);
});

handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

function transformData(sessions, speakers, event, sponsors, tracksData, roomsData, attendeesData, reqOpts, next) {
  fold.foldByTrack(sessions, speakers, tracksData, reqOpts, function(tracks) {
    const days = fold.foldByDate(tracks);
    const sociallinks = fold.createSocialLinks(event);

    fold.extractEventUrls(event, speakers, sponsors, reqOpts, function(eventurls) {
      const copyright = fold.getCopyrightData(event);

      fold.foldByLevel(sponsors, reqOpts, function(sponsorpics) {
        const roomsinfo = fold.foldByRooms(roomsData, sessions, speakers, tracksData);

        fold.foldBySpeakers(speakers, sessions, tracksData, reqOpts, function(speakerslist) {
          const apptitle = fold.getAppName(event);
          const timeList = fold.foldByTime(sessions, speakers, tracksData);
          const metaauthor = fold.getOrganizerName(event);
          const tracknames = fold.returnTracknames(sessions, tracksData);
          const roomsnames = fold.returnRoomnames(roomsinfo);
          const attendees = fold.returnAttendees(attendeesData);

          next({
            tracks, days, sociallinks,
            eventurls, copyright, sponsorpics,
            roomsinfo, apptitle, speakerslist, timeList, metaauthor, tracknames, roomsnames, attendees
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
    let attendeesData = '';

    if (reqOpts.datasource === 'jsonupload' && fs.existsSync(distJsonsPath + '/attendees')) {
      attendeesData = jsonfile.readFileSync(distJsonsPath + '/attendees');
    }

    return transformData(sessionsData, speakersData, eventData, sponsorsData, tracksData, roomsData, attendeesData, reqOpts, function(data) {
      next(null, data);
    });
  } catch (err) {
    return next(err);
  }
}

function checkLinks(jsonData, data) {
  function changeEventUrlLinks(eventUrlLogo, eventUrlName) {
    if (eventUrlLogo && eventUrlName) {
      data.eventurls.logo_url = '../' + eventUrlLogo;
      data.eventurls.name = '../' + eventUrlName;
    }
  }

  if (jsonData.tracks !== undefined) {
    data.tracks = true;
  }
  if (jsonData.roomsinfo !== undefined) {
    data.roomsinfo = true;
  }
  if (jsonData.speakerslist !== undefined) {
    data.speakerslist = true;
  }
  if (jsonData.timeList !== undefined) {
    data.timeList = true;
  }

  data.eventurls = JSON.parse(JSON.stringify(jsonData.eventurls));
  data.sociallinks = jsonData.sociallinks;
  data.copyright = jsonData.copyright;
  data.gcalendar = jsonData.gcalendar;

  changeEventUrlLinks(jsonData.eventurls.logo_url, jsonData.eventurls.name);
}

function metaData(jsonData, data) {
  data.apptitle = jsonData.apptitle;
  data.metaauthor = jsonData.metaauthor;
}

function setPageFlag(jsonData, page) {
  jsonData.trackFlag = jsonData.scheduleFlag = jsonData.roomFlag = jsonData.indexFlag = jsonData.CoCflag = jsonData.speakerFlag = 0;
  // eslint-disable-next-line default-case
  switch (page) {
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
    case 'CoC':
      jsonData.CoCflag = 1;
      break;
  }
}

exports.uploadJsonZip = function(fileData, socket) {
  distHelper.uploadWithProgress(fileData.singlefileUpload, fileData.zipLength, socket);
};
exports.finishZipUpload = function(file, id) {
  console.log('=============================ZIP SAVED\n');
  console.log(file.base);
  console.log(file.pathName);
  const count = app.getCount();

  distHelper.moveZip(file.pathName, count);
};

exports.startZipUpload = function(id, socket) {
  console.log('========================ZIP UPLOAD START\n\n');
  distHelper.makeUploadsDir(id, socket);
  distHelper.cleanUploads(id);
};

exports.createDistDir = function(req, socket, callback) {
  console.log(req.body);
  // since we don't give the name of the app, we use a dummy value 'tempProject' in place of it
  req.body.name = 'tempProject' + socket.connId; // temporary name for the project till the time we get the actual name of the event
  const theme = req.body.theme;
  const mode = req.body.sessionMode;
  const type = req.body.apiVersion || 'api_v2';

  if (type === 'api_v1') {
    fold = require(__dirname + '/fold_v1.js');
  } else {
    fold = require(__dirname + '/fold_v2.js');
  }

  let appFolder = req.body.email + '/' + fold.slugify(req.body.name);
  const uploadsId = req.body.uploadsId;
  let emit = false;

  if (socket.constructor.name === 'Socket') {
    emit = true;
  }
  // the below variable will store the actual name of the event
  let eventName;

  async.series([
    (done) => {
      console.log('================================CLEANING TEMPORARY FOLDERS\n');
      logger.addLog('Info', 'Cleaning up the previously existing temporary folders', socket);
      if (emit) {
        socket.emit('live.process', {donePercent: 5, status: 'Cleaning temporary folder'});
      }
      fs.remove(distHelper.distPath + '/' + appFolder, (err) => {
        if (err) {
          logger.addLog('Error', 'Failed to clean up the previously existing temporary folders', socket, err);
          callback(null);
          console.log(err);
          done(err);
        }
        logger.addLog('Success', 'Successfully cleaned up the temporary folders', socket);
        done(null, 'clean');
      });
    },
    (done) => {
      console.log('================================MAKING\n');
      logger.addLog('Info', 'Making the dist folder', socket);
      if (emit) {
        socket.emit('live.process', {donePercent: 10, status: 'Making dist folder'});
      }
      distHelper.makeDistDir(appFolder, socket);
      done(null, 'make');
    },
    (done) => {
      if (emit) {
        socket.emit('live.process', {donePercent: 20, status: 'Copying assets'});
      }
      logger.addLog('Info', 'Copying Assets', socket);
      distHelper.copyAssets(appFolder, (copyerr) => {
        console.log('================================COPYING\n');

        if (copyerr) {
          console.log(copyerr);
          logger.addLog('Error', 'Error occured while copying assets into the appFolder', socket, copyerr);
          callback(null);
          return socket.emit('live.error', {donePercent: 30, status: 'Error in Copying assets'});
        }
        logger.addLog('Success', 'Assets were successfully copied', socket);
        done(null, 'copy');
      });
    },
    (done) => {
      if (emit) {
        socket.emit('live.process', {donePercent: 40, status: 'Cleaning dependencies folder'});
      }
      logger.addLog('Info', 'Cleaning dependencies folder created as a part of copying assets inside the appFolder', socket);
      distHelper.removeDependency(appFolder, socket, (copyerr) => {
        console.log('============================Moving contents from dependency folder and deleting the dependency folder');
        if (copyerr) {
          logger.addLog('Error', 'Error while reading directory', socket, copyerr);
          callback(null);
          console.log(copyerr);
          return socket.emit('live.error', {donePercent: 45, status: 'Error in moving files from dependency folder'});
        }
        return gulp.minifyJs(distHelper.distPath + '/' + appFolder, function() {
          logger.addLog('Success', 'Dependencies folder cleaned successfully', socket);
          return done(null, 'move');
        });
      });
    },
    (done) => {
      console.log('================================COPYING JSONS\n');
      logger.addLog('Info', 'Copying Jsons', socket);
      if (emit) {
        socket.emit('live.process', {donePercent: 50, status: 'Copying the JSONs'});
      }
      switch (req.body.datasource) {
        case 'jsonupload':
          logger.addLog('Info', 'Jsons have been uploaded by the user', socket);
          distHelper.copyUploads(appFolder, socket, uploadsId, function(err) {
            if (err) {
              console.log(err);
              callback(null);
              done(err);
            } else {
              done(null, 'copyUploads');
            }
          });
          break;
        case 'eventapi':
          console.log('================================FETCHING JSONS\n');
          logger.addLog('Info', 'Fetching Jsons from the internet', socket);
          distHelper.fetchApiJsons(appFolder, req.body.apiendpoint, req.body.apiVersion, socket, (err) => {
            if (err) {
              console.log(err);
              callback(null);
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
      if (emit) {
        socket.emit('live.process', {donePercent: 60, status: 'Compiling the SASS files'});
      }
      sass.render({
        file: __dirname + '/_scss/_themes/_' + theme + '-theme/_' + theme + '.scss',
        outFile: distHelper.distPath + '/' + appFolder + '/css/schedule.css'
      }, function(err, result) {
        if (!err) {
          logger.addLog('Success', 'SASS file compiled successfully', socket);
          fs.writeFile(distHelper.distPath + '/' + appFolder + '/css/schedule.css', result.css, (writeErr) => {
            if (writeErr) {
              logger.addLog('Error', 'Error in writing css file', socket, writeErr);
              console.log(writeErr);
              return socket.emit('live.error', {status: 'Error in Writing css file'});
            }
            return gulp.minifyCss(distHelper.distPath + '/' + appFolder, function() {
              logger.addLog('Success', 'css file was written successfully', socket);
              return done(null, 'sass');
            });
          });
        } else {
          logger.addLog('Error', 'Error in compiling SASS', socket, err);
          console.log(err);
          if (emit) {
            socket.emit('live.error', {status: 'Error in Compiling SASS'});
          }
          callback(null);
        }
      });
    },
    (done) => {
      logger.addLog('Info', 'Extracting data from the uploaded jsons', socket);
      if (socket.constructor.name === 'ServerResponse') {
        socket.send('Website generation started. You\'ll get an email when it is ready');
      }
      console.log('================================WRITING\n');
      if (emit) {
        socket.emit('live.process', {donePercent: 65, status: 'Extracting data from the uploaded jsons'});
      }

      getJsonData(req.body, function(error, data) {
        if (error) {
          console.log(error);
          logger.addLog('Error', 'Invalid Zip', socket, error);
          if (emit) {
            socket.emit('live.error', {status: 'Error in read contents of zip'});
          }
          callback(null);
          return done(error);
        }

        logger.addLog('Success', 'Json data extracted', socket);
        logger.addLog('Info', 'Name of the event found from the event json file', socket);
        if (emit) {
          socket.emit('live.process', {donePercent: 67, status: 'Processing images to a standard size'});
        }
        logger.addLog('Info', 'Processing images to a standard size', socket);

        const jsonData = data;
        eventName = fold.removeSpace(jsonData.eventurls.name);
        const backPath = distHelper.distPath + '/' + appFolder + '/' + jsonData.eventurls.background_path;
        const basePath = distHelper.distPath + '/' + appFolder + '/images';
        const logoPath = distHelper.distPath + '/' + appFolder + '/' + jsonData.eventurls.logo_url;
        logger.addLog('Info', 'Resizing logo and background images', socket);
        distHelper.optimizeBackground(backPath, socket, function() {
          if (jsonData.eventurls.logo_url) {
            distHelper.optimizeLogo(logoPath, socket, function(err, pad) {
              if (err) {
                console.log(err);
                // TODO(Areeb): Temporarily disabling image check due to faulty images in event JSON
                // callback(null);
                // return done(err);
              }
              jsonData.navpad = pad;
            });
          }
          if (req.body.theme === 'light') {
            jsonData.theme = 0;
          } else {
            jsonData.theme = 1;
          }

          if (req.body.map === 'googleMap') {
            jsonData.map = 1;
          } else {
            jsonData.map = 0;
          }

          if (req.body.ganalyticsID) {
            jsonData.ganalyticsID = req.body.ganalyticsID;
          }

          if (req.body.gcalendar) {
            jsonData.gcalendar = {};
            jsonData.gcalendar.enabled = true;
            jsonData.gcalendar.body = req.body.gcalendar;
          } else {
            jsonData.gcalendar = {};
            jsonData.gcalendar.enabled = false;
          }
          logger.addLog('Info', 'Resizing sponsors images', socket);
          distHelper.resizeSponsors(basePath, socket, function() {
            logger.addLog('Info', 'Resizing speakers images', socket);
            distHelper.resizeSpeakers(basePath, socket, function() {
              logger.addLog('Success', 'All the images are successfully processed', socket);
              if (emit) {
                socket.emit('live.process', {donePercent: 71, status: 'Compiling the html pages from the templates'});
              }
              logger.addLog('Info', 'Compiling the html pages from the templates', socket);
              templateGenerate();
            });
          });
        });

        function templateGenerate() {
          try {
            registerPartial('navbar');
            registerPartial('footer');
            registerPartial('scroll');
            registerPartial('social');
            registerPartial('tracklist');
            registerPartial('roomlist');
            registerPartial('googleanalytics');

            const tracksTpl = compileTemplate('tracks');
            const scheduleTpl = compileTemplate('schedule');
            const roomstpl = compileTemplate('rooms');
            const speakerstpl = compileTemplate('speakers');
            const eventtpl = compileTemplate('event');
            const sessiontpl = compileTemplate('session');
            const codeOfConductTpl = compileTemplate('CoC');

            if (mode === 'single') {
              logger.addLog('Info', 'Generating Single Page for each session', socket);

              jsonData.mode = mode;
              const trackArr = jsonData.tracks;

              for (let i = 0; i < trackArr.length; i++) {
                const sessionArr = trackArr[i].sessions;

                for (let j = 0; j < sessionArr.length; j++) {
                  const sessionObj = JSON.parse(JSON.stringify(sessionArr[j]));
                  const sessionId = sessionObj.session_id;
                  const speakerList = sessionObj.speakers_list;

                  sessionObj.color = trackArr[i].color;
                  sessionObj.font_color = trackArr[i].font_color;
                  sessionObj.track_title = trackArr[i].title;
                  sessionObj.track_jump_link = '../tracks.html#' + trackArr[i].slug;
                  sessionObj.room_jump_link = '../rooms.html#' + sessionObj.startDate + '-' + fold.replaceSpaceWithUnderscore(sessionObj.location);

                  for (let k = 0; k < speakerList.length; k++) {
                    speakerList[k].thumb = '../' + speakerList[k].thumb;
                  }

                  const completeData = {session: sessionObj};

                  completeData.single_session = true;
                  checkLinks(jsonData, completeData);
                  metaData(jsonData, completeData);
                  fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/sessions/session_' + sessionId + '.html', sessiontpl(completeData));
                }
              }
              logger.addLog('Success', 'Generated single page for each session', socket);
            }
            setPageFlag(jsonData, 'track');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/tracks.html', tracksTpl(jsonData));

            setPageFlag(jsonData, 'schedule');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/schedule.html', scheduleTpl(jsonData));

            setPageFlag(jsonData, 'room');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/rooms.html', roomstpl(jsonData));

            setPageFlag(jsonData, 'speaker');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/speakers.html', speakerstpl(jsonData));

            setPageFlag(jsonData, 'index');
            fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/index.html', eventtpl(jsonData));

            if (jsonData.eventurls.codeOfConduct) {
              setPageFlag(jsonData, 'CoC');
              fs.writeFileSync(distHelper.distPath + '/' + appFolder + '/CoC.html', codeOfConductTpl(jsonData));
            }
          } catch (err) {
            console.log(err);
            logger.addLog('Error', 'Error in compiling/writing templates', socket, err);
            callback(null);
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
      console.log('============Cleaning up remaining folders of the same name\n');
      if (emit) {
        socket.emit('live.process', {donePercent: 75, status: 'Cleaning up folders of the same name'});
      }

      distHelper.removeDuplicateEventFolders(eventName, req.body.email, socket, (remerr) => {
        if (remerr) {
          logger.addLog('Error', 'Error occured while removing the duplicate event folders', socket, remerr);
          callback(null);
          console.log(remerr);
          if (emit) {
            socket.emit('live.error', {status: 'Error in removing the duplicate event folders of the same name'});
          }
        }
        return done(null, 'remove');
      });
    },
    (done) => {
      logger.addLog('Info', 'Renaming temporary folder to the actual event folder', socket);
      console.log('============Renaming temporary folder to the actual event folder');
      if (emit) {
        socket.emit('live.process', {donePercent: 80, status: 'Generating the event folder'});
      }

      const eventFolderSource = __dirname + '/../../dist/';

      fs.move(eventFolderSource + appFolder, eventFolderSource + req.body.email + '/' + eventName, (moveerr) => {
        if (moveerr) {
          logger.addLog('Error', 'Error in moving files to the event folders', socket, moveerr);
          callback(null);
          console.log(moveerr);
          if (emit) {
            socket.emit('live.error', {status: 'Error in moving files to the event directory'});
          }
        }
        logger.addLog('Success', 'Changed the temporary name of the project to its actual name', socket);
        appFolder = req.body.email + '/' + eventName;
        done(null, 'move');
      });
    },
    (done) => {
      logger.addLog('Info', 'Calculating the hash of the event folder and copying the service worker file', socket);
      console.log('Calculating the hash of the event folder and copying the service worker file');
      if (emit) {
        socket.emit('live.process', {donePercent: 85, status: 'Copying Service Worker File'});
      }

      hasher.hashElement(eventName, distHelper.distPath + '/' + req.body.email, function(err, hashObj) {
        if (err) {
          console.log(err);
          logger.addLog('Error', 'Error occured when calculating hash of event folder', socket, err);
          callback(null);
          return done(err);
        }
        distHelper.copyServiceWorker(appFolder, hashObj.hash, function(error) {
          if (error) {
            console.log(error);
            logger.addLog('Error', 'Error occured while copying service worker file', socket, error);
            callback(null);
            return done(error);
          }
          return done(null);
        });
      });
    },

    (done) => {
      logger.addLog('Info', 'Copying the manifest file', socket);
      if (emit) {
        socket.emit('live.process', {donePercent: 88, status: 'Copying Manifest File'});
      }

      distHelper.copyManifestFile(appFolder, eventName, function(err) {
        if (err) {
          console.log(err);
          logger.addLog('Error', 'Error occured while copying manifest file', socket, err);
          callback(null);
          return done(err);
        }
        return done(null);
      });
    },

    (done) => {
      logger.addLog('Info', 'Creating zip file of the event', socket);
      console.log('==================================Creating zip file');
      if (emit) {
        socket.emit('live.process', {donePercent: 90, status: 'Website is being generated'});
      }
      const output = fs.createWriteStream(distHelper.distPath + '/' + req.body.email + '/event.zip');
      const archive = archiver('zip', {store: true});

      output.on('close', function() {
        logger.addLog('Success', 'Zip file has been created', socket);
        done(null, 'zip');
      });
      archive.on('error', function(err) {
        logger.addLog('Error', 'Error occured while zipping the file', socket, err);
        callback(null);
      });
      archive.pipe(output);
      archive.directory(distHelper.distPath + '/' + appFolder, '/').finalize();
    },
    (done) => {
      logger.addLog('Info', 'Sending mail to the user', socket);
      console.log('=================================SENDING MAIL\n');
      if (emit) {
        socket.emit('live.process', {donePercent: 95, status: 'Website is being generated'});
      }

      if (req.body.ftpdetails) {
        setTimeout(() => {
          ftpDeployer.deploy(req.body.ftpdetails, appFolder, () => {
            // Send call back to orga server
          });
        }, 30000);
      }

      mailer.uploadAndsendMail(req.body.email, eventName, socket, (obj) => {
        if (obj.mail) {
          logger.addLog('Success', 'Mail sent succesfully', socket);
        } else {
          logger.addLog('Error', 'Error sending mail', socket);
        }

        if (emit) {
          socket.emit('live.ready', {
            appDir: appFolder,
            url: obj.url
          });
          callback(null);
        } else {
          callback(appFolder);
        }

        done(null, 'write');
      });

      process.on('uncaughtException', function(err) {
        if (err.code === 'ETIMEDOUT') {
          console.log('Failed to connect to address ' + err.address);
          logger.addLog('Error', 'Failed to connect to address ' + err.address, socket);
        } else {
          console.log(err);
        }
        callback(null);
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

