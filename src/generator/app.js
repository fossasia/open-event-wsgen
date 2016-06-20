'use strict';

var express = require('express');
var multer = require('multer');
var app = express();

var upload = multer({dest: 'uploads/'});

var generator = require('./backend/generator.js');

var uploadedFiles = upload.fields([
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

app.post('/live', uploadedFiles, function(req, res) {
  generator.createDistDir(req, function() {
    generator.showLivePreview(res);
  });
});

app.post('/generate', uploadedFiles, function(req, res) {
  generator.createDistDir(req, function() {
    generator.pipeZipToRes(res);
  });
});

app.use("*",function(req,res){
  res.sendFile(__dirname + "/www/404.html");
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
