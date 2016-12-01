'use strict';

const express = require('express');
const connectDomain = require('connect-domain');
const compression = require('compression');
const bodyParser = require('body-parser');
const path = require('path');
var siofu = require("socketio-file-upload");
var generator = require('./backend/generator.js');

const config = require('../config.json');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.use(compression());
app.use(siofu.router);
var errorHandler;

io.on('connection', function(socket){
  socket.on('disconnect', function () {
  });

  var uploader = new siofu();
  uploader.dir = path.join(__dirname, "..",  "uploads");
  uploader.listen(socket);
  uploader.on('error', function(err) {
    console.log(err)
  });
  uploader.on('saved', function(event) {
    generator.finishZipUpload(event.file)
  });
  uploader.on('progress', function(event) {
    console.log(event.file.bytesLoaded / event.file.size)
    socket.emit('upload.progress', {
      percentage:(event.file.bytesLoaded / event.file.size) * 100
    })
  });
  uploader.on('start', function(event) {
    generator.startZipUpload(event.file)
  });

  socket.on('live', function(formData) {
    var req = {body: formData};
    generator.createDistDir(req, socket, function(appFolder, url) {
      socket.emit('live.ready', {
        appDir: appFolder,
        url: url
      });
      //generator.showLivePreview(req, socket);
    });
  });
  socket.on('upload', function(fileData) {
    generator.uploadJsonZip(fileData, socket)
  })
});

app.use(connectDomain());
errorHandler = function(err, req, res, next) {
  res.sendFile(__dirname + '/www/404.html');
  console.log(err);
};


app.set('port', (process.env.PORT || config.PORT));

// Use the www folder as static frontend
app.use('/', express.static(__dirname + '/www'));
app.use('/live/preview', express.static(__dirname + '/../dist'));

app.get('/download/:email/:appname', function (req, res) {
  generator.pipeZipToRes(req.params.email, req.params.appname, res);
}).use(errorHandler);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/generate', function (req, res) {
  generator.createDistDir(req, res, function(appFolder) {
    res.send("Website generation started. You'll get an email when it is ready");
  });
});

app.use('*', function(req, res) {
  res.sendFile(__dirname + '/www/404.html');
});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = {
  getApp: function () {
    return app;
  }
};
