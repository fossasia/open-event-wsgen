'use strict';

var express = require('express');
var app = express();

var generator = require('./backend/generator.js');

app.set('port', (process.env.PORT || 5000));

// Use the www folder as static frontend
app.use('/', express.static(__dirname + '/www'));

app.all('/generate', function(req, res) {
  res.setHeader('Content-Type', 'application/zip');
  res.send(generator.getSchedulePage().toBuffer());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
