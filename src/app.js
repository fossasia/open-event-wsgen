'use strict';

const express = require('express');
const cookie = require('cookie');
const connectDomain = require('connect-domain');
const compression = require('compression');
const path = require('path');
const cookieParser = require('cookie-parser');
const siofu = require('socketio-file-upload');
const bodyParser = require('body-parser');
const generator = require('./backend/generator.js');
const deploy = require('./backend/deploy.js');
const config = require('../config.json');
const passport = require('passport');
const Strategy = require('passport-github').Strategy;
const session = require('express-session');
const MemoryStore = session.MemoryStore;
const sessionStore = new MemoryStore();
const clientId = process.env.GITHUB_CLIENT_ID || config.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET || config.GITHUB_CLIENT_SECRET;
const sessionSecret = process.env.SESSION_SECRET || config.SESSION_SECRET;
const callbackUrl = process.env.CALLBACK_URL || config.CALLBACK_URL;

var errorHandler;
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var id = 0;

app.use(compression());
app.use(siofu.router);
app.use(require('cookie-parser')());
app.use(session({secret: sessionSecret, resave: true, saveUninitialized: true, store: sessionStore}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy({
  clientID: clientId,
  clientSecret: clientSecret,
  callbackURL: callbackUrl
}, function(accessToken, refreshToken, profile, cb) {
  profile.token = accessToken;
  return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

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
  });

  socket.on('live', function(formData) {
    var req = {body: formData};
    generator.createDistDir(req, socket, function(appFolder, url) {
      socket.emit('live.ready', {
        appDir: appFolder,
        url: url
      });
    });
  });

  socket.on('upload', function(fileData) {
    generator.uploadJsonZip(fileData, socket);
  });

});

io.of('/deploy').on('connection', function(socket) {
  socket.on('start', function(msg) {
    console.log(msg);
    socket.abortDeploy = false;
    var parsedCookie = cookie.parse(socket.request.headers.cookie);
    var sid = cookieParser.signedCookie(parsedCookie['connect.sid'], sessionSecret);
    var folder = cookieParser.signedCookie(parsedCookie['folder'], sessionSecret);

    sessionStore.get(sid, function(err, session) {
      if(err) {
        console.log('error while getting session information');
        console.log(err);
      }
      deploy(session.token, folder, session.owner, socket, function() {
        console.log('Deploy Process Finished');
      });
    });
  });

  socket.on('stop', function(msg) {
    console.log(msg);
    socket.abortDeploy = true;
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

app.get('/auth', passport.authenticate('github', {
  scope: ['public_repo', 'delete_repo', 'read:org']
}));

app.get('/auth/callback',
        passport.authenticate('github', {failureRedirect: '/auth', successRedirect: '/deploy' }));

app.get('/deploy', function(req, res) {
  if(req.user === undefined) {
    res.redirect('/');
    return;
  }
  req.session.token = req.user.token;
  req.session.owner = req.user.username;
  res.sendFile(__dirname + '/www/deploy.html');
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
