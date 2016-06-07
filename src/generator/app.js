'use strict';
var express = require('express');
var app = express();

var generator = require('./backend/generator.js')

// Use the www folder as static frontend
app.use('/', express.static(__dirname + '/www'));

app.all('/generate', function (req, res) {
  res.setHeader('Content-Type', 'application/zip')
  res.send(generator.getSchedulePage().toBuffer());
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
