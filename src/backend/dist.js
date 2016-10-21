'use strict';

const fs = require('fs-extra');
const request = require('request');
const async = require('async');
const admZip = require('adm-zip');
const progressStream = require('progress-stream');
const streamBuffer = require('stream-buffers');
const path = require("path");

const distPath = __dirname + '/../../dist';
const uploadsPath = __dirname + '/../../uploads';
const mockPath = __dirname + '/../../mockjson';

const downloadFile = function(url, filePath) {
  const fileStream = fs.createWriteStream(filePath);

  fileStream.on('error', function(err) {
    console.log(err);
  });
  fileStream.on('finish', function () {
    fileStream.close();
  });

  try {
    request.get(url, {timeout: 50000, Accept: 'application/octet-stream'}).pipe(fileStream);
  } catch (err) {
    console.log(err);
  }
};

const downloadAudioFile = function(url, filePath, next) {
  const fileStream = fs.createWriteStream(filePath);

  fileStream.on('error', function(err) {
    console.log(err);
  });
  fileStream.on('finish', function () {
    fileStream.close();
  });

  try {
    request.get(url, {timeout: 50000}, function(error, response, body){
      response.pipe(fileStream);
       next();
    })
   
  } catch (err) {
    console.log(err);
  }
};

const downloadJson = function(appPath, endpoint, jsonFile, cb) {
  const fileStream = fs.createWriteStream(appPath + '/json/' + jsonFile);

  fileStream.on('error', function(err) {
    console.log(err);
  });
  fileStream.on('finish', function () {
    cb();
  });

  try {
    console.log('Downloading ' + endpoint + '/' + jsonFile);
    request
        .get(endpoint + '/' + jsonFile)
        .on('response', function(response) {
          if (response.statusCode != 200) {
            cb(new Error('Response = ' + response.statusCode + 'received'));
          }
        })
        .pipe(fileStream);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  distPath,
  uploadsPath,
  moveZip: function(dlPath) {
    fs.move(dlPath, path.join(__dirname, "../../uploads/upload.zip"), () => {
      
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
  cleanUploads: function() {
    fs.emptyDirSync(uploadsPath);
  },
  cleanDist: function(appFolder, err) {
    fs.emptyDir(distPath + '/' + appFolder, (emptyErr) => {
      if(emptyErr)
         err(emptyErr);
      fs.remove(distPath + '/' + appFolder, err);
    });
  },
  makeUploadsDir: function(err) {
    fs.mkdirpSync(uploadsPath);
  },
  makeDistDir: function(appFolder, err) {
    const appPath = distPath + '/' + appFolder;
    fs.mkdirpSync(distPath);
    fs.mkdirpSync(appPath);
    fs.mkdirpSync(appPath + '/audio');
    fs.mkdirpSync(appPath + '/images/speakers');
    fs.mkdirpSync(appPath + '/images/sponsors');
  },
  copyAssets: function(appFolder, err) {
    const appPath = distPath + '/' + appFolder;
    fs.copy((__dirname + '/assets'), appPath, {clobber: true}, err);
  },
  removeDependency: function(appFolder, done) {
    const appPath = distPath + '/' + appFolder;
    const cssPath = appPath + '/css';
    const jsPath = appPath + '/js';
    const imagesPath = appPath + '/images';
    const dependencyPath = appPath + '/dependencies';
    fs.readdir(dependencyPath, function(err, list){
      if(err) {
        //console.log("Error in reading the directory\n");
        return done(err);
      }
      //console.log(list);
      // the variable below stores the no of files copied so far
      var filesCopiedCounter = 0;

      //check whether an error occured during the copying of a file or not
      function checkFileCopyError(err) {
        if(err) {
          return done(err);
        }
        // Since error didn't occur, increament the no of files copied by one
        filesCopiedCounter += 1;
      }

      // checks whether all the files of the folder have been copied or not
      function checkForCompletion(){
        if(filesCopiedCounter === list.length){
          fs.remove(dependencyPath, done);
        }
      }

      list.forEach(function(file){
        //console.log(file);
        var extension = path.extname(file);
        var filePath = dependencyPath + '/' + file;
        switch(extension) {
          case '':
            fs.copy(filePath, appPath + '/' + file, function(err){
              checkFileCopyError(err);
              checkForCompletion();
            });
          break;
          case '.css':
            fs.copy(filePath, cssPath + '/' + file, function(err) {
              checkFileCopyError(err);
                checkForCompletion();
            });
          break;
          case '.png':
            fs.copy(filePath, imagesPath + '/' + file, function(err) {
              checkFileCopyError(err);
              checkForCompletion();
            });
          break;
          case '.js':
            fs.copy(filePath, jsPath + '/' + file, function(err) {
              checkFileCopyError(err);
              checkForCompletion();
            });
          break;
        }
      });
    });
  },
  copyUploads: function(appFolder) {
    const appPath = distPath + '/' + appFolder;
    fs.mkdirpSync(appPath + '/json');
    var zip = new admZip(path.join(uploadsPath, 'upload.zip'));
     var zipEntries = zip.getEntries(); 

     zipEntries.forEach(function(zipEntry) {
     
      switch(zipEntry.entryName){
        case 'images/':
        zip.extractEntryTo("images/", appPath ); 
        break;
        case 'audio/':
        zip.extractEntryTo("audio/", appPath);
        break;
        case 'sessions':
        zip.extractEntryTo("sessions", appPath +'/json/');
        break;
        case 'speakers':
        zip.extractEntryTo("speakers", appPath +'/json/');
        break;
        case 'microlocations' :
        zip.extractEntryTo("microlocations", appPath+'/json/');
        break;
        case 'event' :
        zip.extractEntryTo("event", appPath +'/json/');
        break;
        case 'sponsors' :
        zip.extractEntryTo("sponsors", appPath +'/json/');
        break;
        case 'tracks':
        zip.extractEntryTo("tracks", appPath +'/json/');
        break;
        default:
      }
  
      
    });
    
  },
  removeDuplicateEventFolders: function(newName, emailAddress, done) {
    const searchFolder = distPath + '/' + emailAddress;
    const removeFolder = distPath + '/' + emailAddress + '/' + newName;
    fs.readdir(searchFolder, function(err, list) {
      if(err) {
        //Error in reading the directory
        return done(err);
      }

      //The contents of the directory are in the list array
      //console.log(list);

      // counter stores the no of folders that have been matched against the given event name 
      var counter = 0;
      
      // The function below checks whether all the files have been successfully checked or not. If yes, then return 
      function checkForCompletion() {
        if(counter === list.length) {
          return done(null);
        }
      }

      list.forEach(function(file) { 
        // the duplicate entry we are searching for must be a folder so its extension must be an empty string '' 
        var extension = path.extname(file);
        if(file === newName && extension == '') {
          // duplicate folder found
          fs.remove(removeFolder, function(err) {
            if(err !== null) {
              // error occured during deletion of the duplicate folder
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
  fetchApiJsons: function(appFolder, apiEndpoint, done) {
    const endpoint = apiEndpoint.replace(/\/$/, '');
    const appPath = distPath + '/' + appFolder;

    const jsons = [
      'speakers',
      'sponsors',
      'sessions',
      'tracks',
      'microlocations',
      'event'
    ];

    fs.mkdirpSync(appPath + '/json');
    async.eachSeries(jsons, (json, callback) => {
      downloadJson(appPath, endpoint, json, callback);
    }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Jsons downloaded');
        done();
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
  downloadAudio: function(appFolder, audioUrl) {
    const appPath = distPath + '/' +appFolder;
    const audioFileName = audioUrl.split('/').pop();
    const audioFilePath = 'audio/' + audioFileName;

    

    downloadAudioFile(audioUrl, appPath + '/' + audioFilePath,function(){
      console.log('Downloading audio : ' + audioFileName);
       return audioFilePath;
    });
   
  },
  downloadSpeakerPhoto: function(appFolder, photoUrl) {
    const appPath = distPath + '/' +appFolder;
    const photoFileName = photoUrl.split('/').pop();
    const photoFilePath = 'images/speakers/' + photoFileName;

    console.log('Downloading photo : ' + photoUrl + " to " + photoFilePath);
    downloadFile(photoUrl, appPath + '/' + photoFilePath);
    return photoFilePath;
  },
  downloadLogo: function(appFolder, logoUrl) {
    const appPath = distPath + '/' +appFolder;
    const photoFileName = logoUrl.split('/').pop();
    const photoFilePath = 'images/' + photoFileName;

    console.log('Downloading logo : ' + logoUrl + ' to ' + photoFileName);
    downloadFile(logoUrl, appPath + '/' + photoFilePath);
    return photoFilePath;
  },
   downloadSponsorPhoto: function(appFolder, photoUrl) {
    const appPath = distPath + '/' +appFolder;
    const photoFileName = photoUrl.split('/').pop();
    const photoFilePath = 'images/sponsors/' + photoFileName;

     console.log('Downloading photo : ' + photoUrl + " to " + photoFilePath);
    downloadFile(photoUrl, appPath + '/' + photoFilePath);
    return photoFilePath;
  }
};
