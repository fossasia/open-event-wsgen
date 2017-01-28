/**
 * Created by championswimmer on 15/8/16.
 */
"use strict";
var FtpDeploy = require('ftp-deploy');
var path = require('path');

function deploy(ftpDetails, appFolder, done) {
  var ftpDeploy = new FtpDeploy();

  var config = {
    username: ftpDetails.user,
    password: ftpDetails.pass, // optional, prompted if none given
    host: ftpDetails.host,
    port: 21,
    localRoot: path.join(__dirname, '/../../dist', appFolder),
    remoteRoot: ftpDetails.path,
    exclude: ['.git', '.idea', 'tmp/*'],
    continueOnError: true
  };

  ftpDeploy.on('upload-error', function (data) {
    console.log(data.err); // data will also include filename, relativePath, and other goodies
  });

  ftpDeploy.on('uploaded', function(data) {
    console.log(data);         // same data as uploading event
  });
  ftpDeploy.on('uploading', function(data) {
    console.log(data);         // same data as uploading event
  });
  ftpDeploy.on('error', function(data) {
    console.log(data);         // same data as uploading event
  });

  ftpDeploy.deploy(config, function(err) {
    if (err) { console.log(err); }
    else {
      console.log('finished');
      done();
    }
  });
}

module.exports = {
  deploy
};

