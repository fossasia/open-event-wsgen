/* eslint-disable no-empty-label */
'use strict';

const distHelper = require('./dist.js');
const fs = require('fs');
const Github = require('@octokit/rest');
const gh = new Github();
const async = require('async');
let results, bitmap, i, file, fullPath, eventName, repoName, total, counter, elem, fileName, sha;
const Gemfile = __dirname + '/Gemfile';
const walk = function(dir, done) {
  results = [];
  fs.readdir(dir, function(err, list) {
    if (err) {
      return done(err);
    }
    i = 0;

    (function next() {
      file = list[i++];

      if (!file) {
        return done(null, results);
      }
      file = dir + '/' + file;
      fs.stat(file, function(error_stat, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(error, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

function encode(file_name) {
  bitmap = fs.readFileSync(file_name);

  return new Buffer(bitmap).toString('base64');
}

module.exports = function(accessToken, folder, user, socket, callback) {
  gh.authenticate({type: 'oauth', token: accessToken});
  fullPath = distHelper.distPath + '/' + folder;
  eventName = folder.substr(folder.search('/') + 1);
  repoName = 'eventSiteWebApp';

  async.series([

    (done) => {
      socket.emit('started', 'Deleting previously existing repo of same name');
      console.log('----------Deleting previously existing repo of same name -----------------');

      gh.repos.delete({owner: user, repo: repoName}, function(err, res) {
        if (err) {
          console.log('Event Repo doesn\'t exist');
          socket.emit('errorLog', 'Event Repo doesn\'t exist. Continuing further');
        }
        if (socket.abortDeploy) {
          done('aborted');
          return;
        }
        done(null, 'delete');
      });
    },

    (done) => {
      socket.emit('started', 'Creating the eventSiteWebApp repo');
      console.log('------------Creating the eventSiteWebApp repo ------------');

      gh.repos.create({name: repoName, auto_init: 1}, function(err, response) {
        if (err) {
          console.log('Error happened while creating repository');
          done(err, 'error');
          socket.emit('errorLog', 'Error happened while creating repository. Can\'t continue further');
          return;
        }
        if (socket.abortDeploy) {
          done('aborted');
          return;
        }
        done(null, 'create');
      });
    },

    (done) => {
      socket.emit('started', 'Creating Gemfile in the repository');
      console.log('-------------Creating Gemfile in the eventsiteWebApp repository');

      gh.repos.createFile({owner: user, repo: repoName, path: 'Gemfile', message: 'commit by web app', content: encode(Gemfile)},
        function(err, res) {
          if (err) {
            console.log('Error occured in pushing Gemfile');
            done(err, 'error');
            socket.emit('errorLog', 'Error occured in pushing Gemfile. Can\'t continue further');
            return;
          }
          if (socket.abortDeploy) {
            done('aborted');
            return;
          }
          done(null, 'Gemfile');
        });
    },

    (done) => {
      socket.emit('started', 'Creating a list of all files to be uploaded and committed to Github');
      console.log('-------------Creating a list of all the files to be uploaded and committed to the github--------------');

      walk(fullPath, function(err, resultsArray) {
        if (err) {
          console.log('Error happened while traversing the event site folder');
          done(err, 'error');
          socket.emit('errorLog', 'Error happened while traversing the event site folder. Can\'t continue further');
          return;
        }

        total = resultsArray.length;
        counter = 0;

        function doOne() {
          if (resultsArray.length > 0) {
            elem = resultsArray.shift();
            fileName = elem.substr(elem.search(eventName) + eventName.length + 1);

            console.log(fileName);
            setTimeout(function() {
              socket.emit('select', fileName + ' uploading');
              gh.repos.createFile({owner: user, repo: repoName, path: fileName, message: 'commit by web app', content: encode(elem)},
                function(error, res) {
                  counter += 1;

                  if (error) {
                    console.log('Error occured while uploading ' + fileName);
                    console.log(error);
                    socket.emit('errorLog', 'Error happened while uploading ' + fileName + '. Ignoring');
                  } else {
                    socket.emit('fileUpload', {file: fileName, percent: counter * 100 / total});
                  }

                  if (socket.abortDeploy) {
                    done('aborted');
                    return;
                  }

                  doOne();
                });
            }, 1000);
          } else {
            done(null, 'uploaded and committed');
          }
        }
        doOne();
      });
    },

    (done) => {
      socket.emit('progress', 'File upload done. Creating gh-pages branch');
      console.log('-------------Creating gh-pages branch in the created repository--------------------');

      gh.gitdata.getReference({owner: user, repo: repoName, ref: 'heads/master'}, function(err, res) {
        if (err) {
          console.log('Error happened when getting the sha of latest commit on master branch');
          done(err, 'error');
          socket.emit('errorLog', 'Error happened when getting the sha of latest commit on master branch. Can\'t continue further');
          return;
        }
        if (socket.abortDeploy) {
          done('aborted');
          return;
        }

        sha = res.data.object.sha;

        gh.gitdata.createReference({owner: user, repo: repoName, ref: 'refs/heads/gh-pages', sha: sha}, function(error, response) {
          if (error) {
            console.log('Error happened while creating gh-pages branch');
            done(error, 'error');
            socket.emit('errorLog', 'Error happened while creating gh-pages branch. Can\'t continue further');
            return;
          }
          if (socket.abortDeploy) {
            done('aborted');
            return;
          }

          socket.emit('progress', 'Gh-pages branch created');
          console.log('Gh-pages branch created');
          setTimeout(function() {
            socket.emit('finished', 'http://' + user + '.github.io/' + repoName);
            callback();
          }, 10000);
        });
      });
    }
  ],

  function(err, result) {
    if (err) {
      if (err === 'aborted') {
        console.log('The process was aborted by the user');
        socket.emit('abort', 'The process has been successfully aborted');
      } else {
        console.log('The deployment process failed with an error');
        console.log(err);
      }
    }
  });
};
