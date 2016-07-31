'use strict';

const express = require('express');
const connectDomain = require('connect-domain');
const compression = require('compression');
const generator = require('./backend/generator.js');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(compression());
app.use(connectDomain());
// Use the www folder as static frontend
app.use('/', express.static(__dirname + '/www'));
app.use('/live/preview', express.static(__dirname + '/../../dist'));


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected')
  });

  socket.on('live', (formData) => {

    var req = {body: formData};
    generator.createDistDir(req, socket, (appFolder) => {

      socket.emit('live.ready', {
        appDir: appFolder
      });
      //generator.showLivePreview(req, socket);
    });
  })
});


function errorHandler(err, req, res, next) {
  res.sendFile(__dirname + '/www/404.html');
  console.log(err);
}


app.set( 'port', (process.env.PORT || 5000) );


app.get('/download/:email/:appname',  (req, res) => {
  generator.pipeZipToRes(req.params.email, req.params.appname, res)
}).use(errorHandler);

app.use('*', (req, res) => {
  res.sendFile(__dirname + '/www/404.html');
});

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = {
  getApp() {
    return app;
  }
};
