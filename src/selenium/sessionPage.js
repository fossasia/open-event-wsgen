/* eslint-disable no-empty-label */
'use strict';

const BasePage = require('./basePage.js');
const By = require('selenium-webdriver').By;

const sessionPage = Object.create(BasePage);

sessionPage.getSessionTitle = function() {
  const self = this;
  const titleId = 'title-1090';

  const sessionPromise = new Promise(function(resolve) {
    const title = self.find(By.id(titleId)).getText();

    resolve(title);
  });

  return sessionPromise;
};

sessionPage.getSessionBackgroundColor = function() {
  const self = this;
  const titleId = 'title-1090';

  const sessionPromise = new Promise(function(resolve) {
    const backgroundColor = self.find(By.id(titleId)).getCssValue('background-color');

    resolve(backgroundColor);
  });

  return sessionPromise;
};

sessionPage.getSpeakerName = function() {
  const self = this;
  const speaker = 'desc-speaker-name';

  const sessionPromise = new Promise(function(resolve) {
    const title = self.find(By.className(speaker)).getText();

    resolve(title);
  });

  return sessionPromise;
};

sessionPage.jumpToTrack = function() {
  const self = this;
  const trackClass = 'session-ul';
  const pageVertScrollOffset = 'return window.scrollY';

  const trackPromise =  new Promise(function(resolve) {
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
  const self = this;
  const speakerClass = 'session-speakers-list';
  const pageVertScrollOffset = 'return window.scrollY';

  const speakerPromise =  new Promise(function(resolve) {
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
  const self = this;
  const pageVertScrollOffset = 'return window.scrollY';

  const roomPromise =  new Promise(function(resolve) {
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

