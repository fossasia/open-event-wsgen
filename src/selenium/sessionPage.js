/* eslint-disable no-empty-label */
'use strict';

var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;

var sessionPage = Object.create(BasePage);

sessionPage.getSessionTitle = function() {
  var self = this;
  var titleId = 'title-1090';

  var sessionPromise = new Promise(function(resolve) {
    var title = self.find(By.id(titleId)).getText();

    resolve(title);
  });

  return sessionPromise;
};

sessionPage.getSessionBackgroundColor = function() {
  var self = this;
  var titleId = 'title-1090';

  var sessionPromise = new Promise(function(resolve) {
    var backgroundColor = self.find(By.id(titleId)).getCssValue('background-color');

    resolve(backgroundColor);
  });

  return sessionPromise;
};

sessionPage.getSpeakerName = function() {
  var self = this;
  var speaker = 'graytext';

  var sessionPromise = new Promise(function(resolve) {
    var title = self.find(By.className(speaker)).getText();

    resolve(title);
  });

  return sessionPromise;
};

sessionPage.jumpToTrack = function() {
  var self = this;
  var trackClass = 'session-ul';
  var pageVertScrollOffset = 'return window.scrollY';

  var trackPromise =  new Promise(function(resolve) {
    self.find(By.className(trackClass)).then(function(elem) {
      elem.findElement(By.css('a')).click().then(self.getPageUrl.bind(self))
        .then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function(height) {
            resolve(height > 0 && url.search('tracks') !== -1);
          });
        });
    });
  });

  return trackPromise;
};

sessionPage.jumpToSpeaker = function() {
  var self = this;
  var speakerClass = 'session-speakers-list';
  var pageVertScrollOffset = 'return window.scrollY';

  var speakerPromise =  new Promise(function(resolve) {
    self.find(By.className(speakerClass)).then(function(elem) {
      elem.findElement(By.css('a')).click().then(self.getPageUrl.bind(self))
        .then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function(height) {
            resolve(height > 0 && url.search('speakers') !== -1);
          });
        });
    });
  });

  return speakerPromise;
};

sessionPage.jumpToRoom = function() {
  var self = this;
  var pageVertScrollOffset = 'return window.scrollY';

  var roomPromise =  new Promise(function(resolve) {
    self.find(By.css("a[href='../rooms.html#2017-06-30-Plaza_Room_B']")).then(function(elem) {
      elem.click().then(self.getPageUrl.bind(self))
        .then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function(height) {
            resolve(height > 0 && url.search('rooms') !== -1);
          });
        });
    });
  });

  return roomPromise;
};

module.exports = sessionPage;

