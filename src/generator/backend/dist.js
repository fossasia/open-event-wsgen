'use strict';

const fs = require('fs-extra');
const request = require('request');
const async = require('async');
var admZip = require('adm-zip');
const distPath = __dirname + '/../../../dist';
const uploadsPath = __dirname + '/../../../uploads';
const mockPath = __dirname + '/../../../mockjson';

const downloadFile = function(url, filePath) {
  const fileStream = fs.createWriteStream(filePath);

  fileStream.on('error', function(err) {
    console.log(err);
  });
  try {
    request(url).pipe(fileStream);
  } catch (err) {
    console.log(err);
  }
};

const downloadJson = function(endpoint, jsonFile, cb) {
  const fileStream = fs.createWriteStream(distPath + '/json/' + jsonFile);

  fileStream.on('error', function(err) {
    console.log(err);
  });

  try {
    console.log('Downloading ' + jsonFile);
    request
        .get(endpoint + '/' + jsonFile)
        .on('response', function(response) {
          console.log('Got response');
          console.log(response.statusCode); // 200
          console.log(response.headers['content-type']); // 'image/png'
          cb();
        })
        .pipe(fileStream);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  distPath: distPath,
  cleanUploads: function(err) {
    fs.emptyDir(uploadsPath, err);
  },
  cleanDist: function(err) {
    fs.emptyDir(distPath, (emptyErr) => {
      fs.remove(distPath, err);
    });
  },
  makeDistDir: function(err) {
    fs.mkdirpSync(distPath);
    fs.mkdirpSync(distPath + '/audio');
    fs.mkdirpSync(distPath + '/img/speakers');
  },
  copyAssets: function(err) {
    fs.copy((__dirname + '/assets'), distPath, {clobber: true}, err);
  },
  copyUploads: function(files) {
    fs.mkdirpSync(distPath + '/json');
    var zip = new admZip(files.singlefileUpload[0].path);
    zip.extractAllTo("./dist/json", true);
  },
  fetchApiJsons: function(apiEndpoint, done) {
    const endpoint = apiEndpoint.replace(/\/$/, '');

    const jsons = [
      'speakers.json',
      'sponsors.json',
      'sessions.json',
      'tracks.json',
      'microlocations.json',
      'event.json'
    ];

    fs.mkdirpSync(distPath + '/json');
    async.eachSeries(jsons, (json, callback) => {
      downloadJson(endpoint, json, callback);
    }, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Jsons downloaded');
        done();
      }
    });
  },
  copyMockJsons: function() {
    fs.mkdirpSync(distPath + '/json');
    fs.copySync(mockPath + '/speakers.json', distPath + '/json/speakers.json');
    fs.copySync(mockPath + '/sessions.json', distPath + '/json/sessions.json');
    fs.copySync(mockPath + '/tracks.json', distPath + '/json/tracks.json');
    fs.copySync(mockPath + '/event.json', distPath + '/json/event.json');
    fs.copySync(mockPath + '/sponsors.json', distPath + '/json/sponsors.json');
    fs.copySync(mockPath + '/microlocations.json', distPath + '/json/microlocations.json');
  },
  downloadAudio: function(audioUrl) {
    const audioFileName = audioUrl.split('/').pop();
    const audioFilePath = 'audio/' + audioFileName;

    console.log('Downloading audio : ' + audioFileName);

    downloadFile(audioUrl, distPath + '/' + audioFilePath);
    return audioFilePath;
  },
  downloadSpeakerPhoto: function(photoUrl) {
    const photoFileName = photoUrl.split('/').pop();
    const photoFilePath = 'img/speakers/' + photoFileName;

    console.log('Downloading photo : ' + photoFileName);
    downloadFile(photoUrl, distPath + '/' + photoFilePath);
    return photoFilePath;
  }
};
