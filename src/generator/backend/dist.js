'use strict';

const fs = require('fs-extra');

const distPath = __dirname + '/../../../dist';

module.exports = {
  distPath: distPath,
  cleanDist: function(err) {
    fs.emptyDir(distPath, (emptyErr) => {
      fs.remove(distPath, err);
    })



  },
  makeDistDir: function(err) {
    fs.mkdirp(distPath, err);
  },
  copyAssets: function(err) {
    fs.copy((__dirname + '/assets'), distPath, {clobber:true}, err);
  }
};
