'use strict';

const express = require('express');
const connectDomain = require('connect-domain');
const compression = require('compression');
const bodyParser = require('body-parser');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.use(compression());
var errorHandler;

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function () {
    console.log('user disconnected')
  });

  socket.on('live', function(formData) {
    var req = {body: formData};
    generator.createDistDir(req, socket, function(appFolder) {
      socket.emit('live.ready', {
        appDir: appFolder
      });
      //generator.showLivePreview(req, socket);
    });
  })
});


var generator = require('./backend/generator.js');

app.use(connectDomain());
errorHandler = function(err, req, res, next) {
  res.sendFile(__dirname + '/www/404.html');
  console.log(err);
};


app.set('port', (process.env.PORT || 5000));

// Use the www folder as static frontend
app.use('/', express.static(__dirname + '/www'));
app.use('/live/preview', express.static(__dirname + '/../dist'));

app.get('/download/:email/:appname', function (req, res) {
  generator.pipeZipToRes(req.params.email, req.params.appname, res)
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
