"use strict";
var express = require('express');
var app = express();

var generator = require('./backend/generator.js')

// Use the www folder as static frontend
app.use('/', express.static('www'));

app.get('/generate', function (req, res) {
  res.send(generator.getSchedulePage());
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
