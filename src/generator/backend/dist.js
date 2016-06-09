'use strict';

const fs = require('fs-extra');

const distPath = __dirname + '/../../../dist';
const uploadsPath = __dirname + '/../../../uploads';

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
    fs.mkdirp(distPath, err);
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
  }
};
