'use strict';

var express = require('express');
var connectDomain = require('connect-domain');
var multer = require('multer');
var admZip = require('adm-zip');
var compression = require('compression');

var app = express();
app.use(compression());
var errorHandler;

var upload = multer({dest: 'uploads/'});

var generator = require('./backend/generator.js');

app.use(connectDomain());
errorHandler = function(err, req, res, next) {
  res.sendFile(__dirname + '/www/404.html');
  console.log(err);
};

const uploadedFiles = upload.fields([
  {name: 'singlefileUpload', maxCount: 1},
  {name: 'speakerfile', maxCount: 1},
  {name: 'sessionfile', maxCount: 1},
  {name: 'trackfile', maxCount: 1},
  {name: 'sponsorfile', maxCount: 1},
  {name: 'eventfile', maxCount: 1},
  {name: 'locationfile', maxCount: 1}
]);

app.set('port', (process.env.PORT || 5000));

// Use the www folder as static frontend
app.use('/', express.static(__dirname + '/www'));
app.use('/live/preview', express.static(__dirname + '/../../dist'));

app.post('/live',uploadedFiles, function(req, res) {

  generator.createDistDir(req, function() {
    generator.showLivePreview(req, res);
  });
}).use(errorHandler);

app.post('/generate', uploadedFiles, function(req, res) {
  generator.createDistDir(req, function() {
    generator.pipeZipToRes(req, res);
  });
}).use(errorHandler);

app.use('*', function(req, res) {
  res.sendFile(__dirname + '/www/404.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = {
  getApp: function () {
    return app;
  }
};
