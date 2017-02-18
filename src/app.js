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
var id = 0;


app.use(compression());
app.use(siofu.router);
var errorHandler;

io.on('connection', function(socket){
  socket.on('disconnect', function () {
  });

  id = id + 1;
  socket.connId = id;
  var uploader = new siofu();
  uploader.dir = path.join(__dirname, '..', 'uploads/connection-' + id.toString());
  socket.fileUpload = false;
  uploader.listen(socket);

  uploader.on('error', function(err) {
    console.log(err);
  });

  uploader.on('saved', function(event) {
    generator.finishZipUpload(event.file, socket.connId);
    socket.fileUploaded = true;
  });

  uploader.on('progress', function(event) {
    console.log(event.file.bytesLoaded / event.file.size);
    socket.emit('upload.progress', {
      percentage:(event.file.bytesLoaded / event.file.size) * 100
    });
    // if the abort propert is set to true, then cancel the ongoing upload
    if(socket.fileAbort === true) {
      uploader.abort(event.file.id, socket);
      socket.fileAbort = false;
    }
  });

  uploader.on('start', function(event) {
    generator.startZipUpload(socket.connId);
    socket.fileUploaded = false;
  });

  socket.on('Cancel', function(msg) {
    console.log(msg);
    // if the file has not been fully uploaded, then set the abort property to true
    if(socket.fileUploaded === false) {
      socket.fileAbort = true;
    }
    generator.stopBuild(socket);
  });

  socket.on('live', function(formData) {
    var req = {body: formData};

    generator.enableBuild(socket);

    generator.createDistDir(req, socket, function(appFolder, url) {
      socket.emit('live.ready', {
        appDir: appFolder,
        url: url
      });
      //generator.showLivePreview(req, socket);
    });
  });

  socket.on('upload', function(fileData) {
    generator.uploadJsonZip(fileData, socket);
  });

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
