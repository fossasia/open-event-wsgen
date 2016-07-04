'use strict';

const fs = require('fs-extra');
const request = require('request');
const async = require('async');

const distPath = __dirname + '/../../../dist';
const uploadsPath = __dirname + '/../../../uploads';
const mockPath = __dirname + '/../../../mockjson';

function downloadFile (url, filePath) {

  const fileStream = fs.createWriteStream(filePath);

  fileStream.on('error', function(err) {
    console.log(err);
  });
  try {
    request(url).pipe(fileStream);
  } catch (err) {
    console.log(err);
  }
}

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
    fs.copy((__dirname + '/assets'), distPath, {clobber:true}, err);
  },
  copyUploads: function(files) {
    fs.mkdirpSync(distPath + '/json');
    fs.copySync(files.speakerfile[0].path, distPath + '/json/speakers.json');
    fs.copySync(files.sessionfile[0].path, distPath + '/json/sessions.json');
    fs.copySync(files.trackfile[0].path, distPath + '/json/tracks.json');
    fs.copySync(files.locationfile[0].path, distPath + '/json/microlocations.json');
    fs.copySync(files.sponsorfile[0].path, distPath + '/json/sponsors.json');
    fs.copySync(files.eventfile[0].path, distPath + '/json/event.json');
  },
  fetchApiJsons: function(apiEndpoint) {
    const endpoint = apiEndpoint.replace(/\/$/, '');

    const jsons = [
      'speakers',
      'sponsors',
      'sessions',
      'tracks.json',
      'microlocations.json',
      'event.json'
    ];

    fs.mkdirpSync(distPath + '/json');
    async.each(jsons, function(json) {
      console.log('Downloading ' + endpoint + '/' + json);

      downloadFile(endpoint + '/' + json, distPath + '/json/' + json);
    }, (err) => {
        // if any of the file processing produced an error, err would equal that error
      if(err) {
        // One of the iterations produced an error.
        // All processing will now stop.
        console.log('A file failed to process');
      } else {
        console.log('All files have been processed successfully');
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
