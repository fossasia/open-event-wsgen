'use strict';

const fs = require('fs-extra');
const request = require('request');

const distPath = __dirname + '/../../../dist';
const uploadsPath = __dirname + '/../../../uploads';
const mockPath = __dirname + '/../../../mockjson';

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
    fs.copySync(files.locationfile[0].path, distPath + '/json/locations.json');
    fs.copySync(files.sponsorfile[0].path, distPath + '/json/sponsors.json');
    fs.copySync(files.eventfile[0].path, distPath + '/json/event.json');
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

    console.log('Downloading audio : ' + audioFileName);

    const audioFileStream = fs.createWriteStream(distPath + '/audio/' + audioFileName);

    audioFileStream.on('error', function(err) {
      console.log(err);
    });
    try {
      request(audioUrl).pipe(audioFileStream);
    } catch (err) {
      console.log(err);
    }
    return ('audio/' + audioFileName);
  },
  downloadSpeakerPhoto: function(photoUrl) {
    const photoFileName = photoUrl.split('/').pop();

    console.log('Downloading photo : ' + photoFileName);
    const photoFileStream = fs.createWriteStream(distPath + '/img/speakers/' + photoFileName);

    photoFileStream.on('error', function(err) {
      console.log(err);
    });
    try {
      request(photoUrl).pipe(photoFileStream);
    } catch (err) {
      console.log(err);
    }
    return ('img/speakers/' + photoFileName);
  }
};
