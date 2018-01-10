'use strict';

const fs = require('fs-extra');
var logger = require('./buildlogger.js');
var zip = require('decompress-zip');
const config = require('../../config.json');
const request = require('request').defaults({'proxy': config.proxy});
const async = require('async');
const progressStream = require('progress-stream');
const streamBuffer = require('stream-buffers');
const path = require("path");
const recursive = require('recursive-readdir');
const sharp = require('sharp');

const distPath = __dirname + '/../../dist';
const uploadsPath = __dirname + '/../../uploads';
const mockPath = __dirname + '/../../mockjson';
var JSONAPIDeserializer = require('jsonapi-serializer').Deserializer;

const downloadFile = function(url, filePath, next) {
  const fileStream = fs.createWriteStream(filePath);

  fileStream.on('error', function(err) {
    console.log(err);
  });

  fileStream.on('finish', function () {
    fileStream.close();
  });

  try {
    request.get(url)
      .on('response',function(response){
        response.pipe(fileStream);
        next();
      });
  }

  catch (err) {
    console.log(err);
  }

};

const downloadAudioFile = function(url, filePath, next) {
  const fileStream = fs.createWriteStream(filePath,{encoding: null});

  fileStream.on('error', function(err) {
    console.log(err);
  });

  fileStream.on('finish', function () {
    fileStream.close();
  });

  try {
    request.get(url, {timeout: 100000, Accept: 'application/octet-stream'})
      .on('response',function(response){
        response.pipe(fileStream);
        next();
      });

  }

  catch (err) {
    console.log(err);
  }

};

const downloadJsonFromGithub = function(appPath, endpoint, jsonFile, cb) {
  const fileStream = fs.createWriteStream(appPath + '/json/' + jsonFile);
  var statusCode;

  fileStream.on('error', function(err) {
    console.log(err);
    return cb(err);
  });

  fileStream.on('finish', function () {
    if(statusCode != 200) {
      return cb(new Error('Response = ' + statusCode + ' received'));
    }
    return cb();
  });

  try {
    console.log('Downloading ' + endpoint);
    request
      .get({url:endpoint, timeout:30000})
      .on('error', function (error) {
        console.log('Could not connect to server');
        return cb(new Error(error.code));
      })
      .on('response', function(response) {
        statusCode = response.statusCode;
      })
      .pipe(fileStream);
  }

  catch (err) {
    console.log(err);
    return cb(err);
  }

};

const downloadJsonFromEventyay = function(appPath, endpoint, jsonFile, cb) {
  var fileName = appPath + '/json/' + jsonFile;

  request.get({url: endpoint}, function(err, response, body) {
    if(err) {
      console.log(err);
      return cb(err);
    }
    var json = JSON.parse(body);

    new JSONAPIDeserializer().deserialize(json, function(err, data) {
      fs.writeFile(fileName, JSON.stringify(data), 'utf-8', function(err) {
        if(err) {
          console.log(err);
          return cb(err);
        }
        cb();
      });
    });

  });
};

var extensionChange = function(image) {
  var name = image.substring(0, image.lastIndexOf('.'));
  var extension = image.substring(image.lastIndexOf('.') + 1);
  if(extension === 'jpg') {
    return image + '.new';
  }
  return name + '.jpg';
};

var optimizeBackground = function(image, socket, done) {
  if(image !== null) {
    sharp(image)
      .resize(1150,500)
      .toFile(extensionChange(image), (err) => {
        if(err) {
          console.log(err);
          return 0;
        }
        var extension = image.substring(image.lastIndexOf('.') + 1);
        if(extension === 'jpg') {
          fs.rename(image + '.new', image, function(err) {
            if(err) {
              console.log(err);
            }
          });
        }
        else {
          fs.unlink(image, function(err) {
            if ( err ) console.log('ERROR: ' + err);
          });
        }
      });
  }
  done();
};

var optimizeLogo = function(image, socket, done) {
  sharp(image).metadata(function(err, metaData) {
    if(err) {
      return done(err);
    }
    var width = metaData.width;
    var height = metaData.height;
    var ratio = width/height;
    var padding = 5;
    var diffHeight = 0;

    height = 45;
    width = Math.floor(45 * ratio);
    if (width > 110) {
      width = 110;
      height = Math.floor(width/ratio);
      diffHeight = 45 - height;
      padding = padding + (diffHeight)/2;
    }
    var qualityMultiplier = 4;

    width = width * qualityMultiplier;
    height = height * qualityMultiplier;

    sharp(image).resize(width, height).toFile(image + '.new', function(err, info) {
      if(err) {
        return done(err);
      }
      fs.unlink(image, function(err) {
        if(err) {
          return done(err);
        }
        fs.rename(image + '.new', image, function(err) {
          if(err) {
            return done(err);
          }
          return done(null, padding);
        });
      });
    });
  });
};

var resizeSponsors = function(dir, socket, done) {
  fs.readdir(dir + '/sponsors/', function(err, list){
    if(err) {
      logger.addLog('Info', 'No sponsors images found', socket, err);
    }

    async.each(list, function(image, trial) {
      sharp(dir + '/sponsors/' + image)
        .resize(150, 80)
        .background({r: 255, g: 255, b: 255, alpha: 0})
        .embed()
        .toFile(dir + '/sponsors/' + image + '.new', (err) => {
          if(err) {
            console.log(image + ' Can not be converted');
            console.log(err);
            trial(null);
            return 0;
          }

          fs.rename(dir + '/sponsors/' + image + '.new' , dir + '/sponsors/' + image , function(err) {
            if ( err ) {
              console.log('ERROR: ' + err);
            }
            trial(null);
          });
        });
    }, function(err) {
      console.log("Sponsors images converted successfully");
      done();
    });
  });
};

var resizeSpeakers = function(dir, socket, done) {
  fs.readdir(dir + '/speakers/', function(err, array){
    var list = array.splice(array.splice( array.indexOf('thumbnails'), 1 ));
    if(err) {
      logger.addLog('Info', 'No sponsors images found', socket, err);
    }
    async.each(list, function(image, trial) {
      sharp(dir + '/speakers/' + image)
        .resize(264, 264)
        .background({r: 255, g: 255, b: 255, alpha: 0})
        .embed()
        .toFile(dir + '/speakers/' + extensionChange(image), (err) => {
          if(err) {
            console.log(err);
            trial(null);
            return 0;
          }
          var extension = image.substring(image.lastIndexOf('.') + 1);
          if(extension === 'jpg') {
            fs.rename(dir + '/speakers/' + image + '.new', dir + '/speakers/' + image, function(err) {
              if(err) {
                console.log(err);
              }
              trial(null);
            });
          }
          else {
            fs.unlink(dir + '/speakers/' + image, function(err) {
              if ( err ) console.log('ERROR: ' + err);
            });
            trial(null);
          }
        });
    }, function(err) {
      console.log("Speakers images converted successfully");
      done();
    });
  });
};

module.exports = {
  distPath,
  uploadsPath,
  optimizeBackground,
  resizeSponsors,
  resizeSpeakers,
  extensionChange,
  optimizeLogo,
  moveZip: function(dlPath, id) {
    fs.move(dlPath, path.join(__dirname, "../../uploads/connection-" + id.toString() + "/upload.zip"), () => {

    });
  },
  uploadWithProgress: function(fileBuffer, fileSize, emitter) {
    const progressor = progressStream({length: fileSize, speed: 1}, function(progress) {
      console.log('Zip upload: Status =' + parseInt(progress.percentage) + '%');
      emitter.emit('upload.progress', progress);
    });

    var fileBufferStream = new streamBuffer.ReadableStreamBuffer({
      // frequency: 100,   // in milliseconds.
      chunkSize: 4096  // in bytes.
    });

    fileBufferStream.put(fileBuffer);
    fileBufferStream
      .pipe(progressor)
      .pipe(fs.createWriteStream(path.join(uploadsPath, 'upload.zip')));
  },
  cleanUploads: function(id) {
    fs.emptyDirSync(uploadsPath + '/connection-' + id.toString());
  },
  cleanDist: function(appFolder, err) {
    fs.emptyDir(distPath + '/' + appFolder, (emptyErr) => {
      if(emptyErr) {
        err(emptyErr);
      }
      fs.remove(distPath + '/' + appFolder, err);
    });
  },
  makeUploadsDir: function(id) {
    fs.mkdirpSync(uploadsPath + '/connection-' + id.toString());
  },
  makeDistDir: function(appFolder, socket) {
    const appPath = distPath + '/' + appFolder;
    try {
      fs.mkdirpSync(distPath);
      fs.mkdirpSync(appPath);
      fs.mkdirpSync(appPath + '/audio');
      fs.mkdirpSync(appPath + '/sessions');
      fs.mkdirpSync(appPath + '/images/speakers');
      fs.mkdirpSync(appPath + '/images/sponsors');
      fs.mkdirpSync(appPath + '/images/speakers/thumbnails/');
    }
    catch(err) {
      logger.addLog('Error', 'Error while making dist directory', socket, err);
      console.log(err);
    }
    logger.addLog('Success', 'Dist directory made successfully', socket);
  },
  copyAssets: function(appFolder, err) {
    const appPath = distPath + '/' + appFolder;
    fs.copy((__dirname + '/assets'), appPath, {clobber: true}, err);
  },

  copyServiceWorker: function(appFolder, folderHash, done) {
    const appPath = distPath + '/' + appFolder;
    var filePath = __dirname + '/assets/js/sw.js';

    try {
      var fileData = fs.readFileSync(filePath).toString().split('\n');
      var hashString = "'" + folderHash + "'";
      fileData.unshift("var CACHE_NAME = " + hashString);
      fs.writeFileSync(appPath + '/sw.js', fileData.join('\n'));
      return done(null);
    } catch(err) {
      return done(err);
    }
  },

  copyManifestFile: function(appFolder,eventName, done) {
    const appPath = distPath + '/' + appFolder;
    var filePath = __dirname + '/assets/dependencies/manifest.json';

    try {
      var fileData = fs.readFileSync(filePath).toString().split('\n');
      fileData.unshift("{\n\"name\":\""+eventName+"\",\n\"short_name\":\"" + eventName+"\",");
      fs.writeFileSync(appPath + '/manifest.json', fileData.join('\n'));
      return done(null);
    } catch(err) {
      return done(err);
    }
  },

  removeDependency: function(appFolder, socket, done) {
    const appPath = distPath + '/' + appFolder;
    const cssPath = appPath + '/css';
    const jsPath = appPath + '/js';
    const imagesPath = appPath + '/images';
    const dependencyPath = appPath + '/dependencies';

    logger.addLog('Info', 'Reading the contents of the dependenices directory', socket);
    fs.readdir(dependencyPath, function(err, list){
      if(err) {
        logger.addLog('Error', 'Error while reading directory', socket, err);
        return done(err);
      }
      var filesCopiedCounter = 0;

      function check(err) {
        if(err)
          return done(err);
        filesCopiedCounter += 1;
        if(filesCopiedCounter === list.length){
          logger.addLog('Info', 'All files of the folder have been copied', socket);
          logger.addLog('Info', 'Now removing the dependenices folder', socket);
          fs.remove(dependencyPath, done);
        }
      }

      list.forEach(function(file){
        var extension = path.extname(file);
        var filePath = dependencyPath + '/' + file;
        switch(extension) {
          case '':
            fs.copy(filePath, appPath + '/' + file, check);
            break;
          case '.css':
            fs.copy(filePath, cssPath + '/' + file, check);
            break;
          case '.png':
            fs.copy(filePath, imagesPath + '/' + file, check);
            break;
          case '.js':
            fs.copy(filePath, jsPath + '/' + file, check);
            break;
          case '.html':
            fs.copy(filePath, appPath + '/' + file, check);
            break;
          case '.json':
            fs.copy(filePath, appPath + '/' + file, check);
            break;
        }
      });
    });
  },

  copyUploads: function(appFolder, socket, done) {

    const appPath = distPath + '/' + appFolder;
    try {
      fs.mkdirpSync(appPath + '/json');
      logger.addLog('Info','Creating the json folder inside the appPath', socket);
    }
    catch(err) {
      logger.addLog('Error', 'Error occured while creating the json folder inside the appPath', socket, err);
      console.log(err);
    }
    logger.addLog('Info', 'Extracting entries of the zip folder uploaded by the user', socket);
    var id = socket.connId;
    var unzipper = new zip(path.join(uploadsPath, 'connection-' + id.toString(), 'upload.zip'));

    unzipper.on('error', function (err) {
      logger.addLog('Error', 'Error occurred while Extracting Zip', socket, err);
      console.log(err);
      return done(err);
    });

    unzipper.extract({
      path: appPath + '/zip'
    });

    unzipper.on('extract', function(log) {
      logger.addLog('Info', 'zip successfully extracted', socket);

      async.series([

        function(callback){
          fs.readdir(appPath + '/zip' , function(err, list){
            if(err) {
              logger.addLog('Error', 'Error while reading directory', socket, err);
              return done(err);
            }

            async.each(list, function(file, callback){

              var filePath = appPath + '/zip/' + file;

              function check(err){
                if(err !== null) {
                  logger.addLog('Error', 'Error while copying folder', socket, err);
                  callback(err);
                }
                else {
                  callback(null);
                }
              }

              switch(file) {
                case 'audio':
                  fs.copy(filePath, appPath + '/audio' , check);
                  break;
                case 'images':
                  fs.copy(filePath, appPath + '/' + file, check);
                  break;
                case 'sessions':
                  fs.copy(filePath, appPath + '/json/' + file, check);
                  break;
                case 'speakers':
                  fs.copy(filePath, appPath + '/json/' + file, check);
                  break;
                case 'event':
                  fs.copy(filePath, appPath + '/json/' + file, check);
                  break;
                case 'tracks':
                  fs.copy(filePath, appPath + '/json/' + file, check);
                  break;
                case 'microlocations':
                  fs.copy(filePath, appPath + '/json/' + file, check);
                  break;
                case 'sponsors':
                  fs.copy(filePath, appPath + '/json/' + file, check);
                  break;
                default: callback(null);
              }
            }, function(err) {
              if(err !== null) {
                return done(err);
              }
              else {
                fs.remove(appPath + '/zip', done);
              }
            });
          });
          callback();
        }
      ]);
    });
  },
  removeDuplicateEventFolders: function(newName, emailAddress, socket, done) {
    const searchFolder = distPath + '/' + emailAddress;
    const removeFolder = distPath + '/' + emailAddress + '/' + newName;
    fs.readdir(searchFolder, function(err, list) {
      if(err) {
        logger.addLog('Error', 'Error in reading the directory', socket, err);
        return done(err);
      }
      logger.addLog('Info', 'Directory succesfully read', socket);

      // counter stores the no of folders that have been matched against the given event name
      var counter = 0;

      // The function below checks whether all the files have been successfully checked or not. If yes, then return
      function checkForCompletion() {
        if(counter === list.length) {
          logger.addLog('Info', 'All files in the directory have been compared and duplicate folder removed', socket);
          return done(null);
        }
      }

      list.forEach(function(file) {
        // the duplicate entry we are searching for must be a folder so its extension must be an empty string ''
        var extension = path.extname(file);
        if(file === newName && extension === '') {
          logger.addLog('Info', 'Duplicate folder found having the same name as that of the event', socket);
          // duplicate folder found
          logger.addLog('Info', 'Removing the duplicate folder', socket);
          fs.remove(removeFolder, function(err) {
            if(err !== null) {
              logger.addLog('Error', 'Error occured during deletion of the duplicate folder', socket, err);
              return done(err);
            }
            counter += 1;
            checkForCompletion();
          });
        }
        else {
          counter += 1;
          checkForCompletion();
        }
      });
    });
  },
  fetchApiJsons: function(appFolder, apiEndpoint, socket, done) {
    const endpoint = apiEndpoint.replace(/\/$/, '');
    const appPath = distPath + '/' + appFolder;
    var endpointType = 'github';

    var jsonsUrl = {
      'speakers': '',
      'sponsors': '',
      'sessions': '',
      'tracks': '',
      'microlocations': '',
      'event': '',
    };

    Object.keys(jsonsUrl).forEach(function(key) {
      jsonsUrl[key] = endpoint + '/' + key;
    });

    if(endpoint.search('eventyay') != -1) {
      endpointType = 'eventyay';

      Object.keys(jsonsUrl).forEach(function(key) {

        if (key === 'sessions') {
          jsonsUrl[key] = jsonsUrl[key] + '?include=track,microlocation,session-type,speakers' +
            '&fields[track]=id,name' +
            '&fields[speaker]=id,name' +
            '&fields[microlocation]=id,name' +
            '&page[size]=0';
        }

        else if (key === 'tracks') {
          jsonsUrl[key] = jsonsUrl[key] + '?include=sessions&fields[session]=id,title';
        }

        else if (key === 'event') {
          jsonsUrl[key] = endpoint + '?include=social-links,event-copyright';
        }

        else if (key === 'speakers') {
          jsonsUrl[key] = jsonsUrl[key] + '?include=sessions&fields[session]=id,title';
        }

      });
    }

    try {
      fs.mkdirpSync(appPath + '/json');
      logger.addLog('Info', 'Creating json folder insde the appPath directory', socket);
    }
    catch(err) {
      logger.addLog('Error', 'Error while creating the json folder', socket, err);
      done(err);
    }

    async.forEachOf(jsonsUrl, (endpoint, fileName, callback) => {

      if (endpointType == 'github') {
        downloadJsonFromGithub(appPath, endpoint, fileName, callback);
      } else if (endpointType == 'eventyay') {
        downloadJsonFromEventyay(appPath, endpoint, fileName, callback);
      }
    }, (err) => {
      if (err) {
        logger.addLog('Error', 'Error occured while downloading jsons from the internet', socket, err);
        done(err);
      }
      else {
        console.log('Jsons downloaded');
        done(null);
      }
    });
  },

  copyMockJsons: function(appFolder) {
    const appPath = distPath + '/' + appFolder;
    fs.mkdirpSync(appPath + '/json');
    fs.copySync(mockPath + '/speakers', appPath + '/json/speakers');
    fs.copySync(mockPath + '/sessions', appPath + '/json/sessions');
    fs.copySync(mockPath + '/tracks', appPath + '/json/tracks');
    fs.copySync(mockPath + '/event', appPath + '/json/event');
    fs.copySync(mockPath + '/sponsors', appPath + '/json/sponsors');
    fs.copySync(mockPath + '/microlocations', appPath + '/json/microlocations');
  },
  downloadAudio: function(appFolder, audioUrl, next) {
    const appPath = distPath + '/' +appFolder;
    const audioFileName = audioUrl.split('/').pop();
    const audioFilePath = 'audio/' + audioFileName;

    downloadAudioFile(audioUrl, appPath + '/' + audioFilePath,function(){
      console.log('Downloading audio : ' + audioFileName);
      next(audioFilePath);
    });

  },
  downloadSpeakerPhoto: function(appFolder, photoUrl, next) {
    const appPath = distPath + '/' +appFolder;
    const photoFileName = photoUrl.split('/').pop();
    const photoFilePath = 'images/speakers/' + photoFileName;

    downloadFile(photoUrl, appPath + '/' + photoFilePath, function(){
      console.log('Downloading photo : ' + photoUrl + " to " + photoFilePath);
      next(photoFilePath);
    });
  },
  downloadLogo: function(appFolder, logoUrl, next) {
    const appPath = distPath + '/' +appFolder;
    const photoFileName = logoUrl.split('/').pop();
    const photoFilePath = 'images/' + photoFileName;

    downloadFile(logoUrl, appPath + '/' + photoFilePath, function(){
      console.log('Downloading logo : ' + logoUrl + ' to ' + photoFileName);
      next(photoFilePath);
    });
  },
  downloadSponsorPhoto: function(appFolder, photoUrl, next) {
    const appPath = distPath + '/' +appFolder;
    const photoFileName = photoUrl.split('/').pop();
    const photoFilePath = 'images/sponsors/' + photoFileName;

    downloadFile(photoUrl, appPath + '/' + photoFilePath, function(){
      console.log('Downloading photo : ' + photoUrl + " to " + photoFilePath);
      next(photoFilePath);
    });
  },
  generateThumbnails: function(path, next){
    recursive(path + '/images/speakers/',function (err, files) {
      if(err) {
        console.log("Error happened");
        console.log(err);
      }
      async.each(files, function(file,callback){
        const thumbFileName = file.split('/').pop();
        sharp(file)
          .resize(100, 100)
          .toFile(path + '/images/speakers/thumbnails/' + thumbFileName, function(err, info) {
            if (err) {
              console.log("Error happened in sharp");
              console.log(err);
            }
            callback();
          });
      },function(){
        next();
      });
    });
  }
};
