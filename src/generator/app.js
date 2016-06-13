'use strict';

var express = require('express');
var multer = require('multer');
var app = express();

var upload = multer({ dest: 'uploads/' });

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

app.post('/generate', uploadedFiles, function(req, res, next) {
  res.setHeader('Content-Type', 'application/zip');
  generator.pipeZipToRes(req, res);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
