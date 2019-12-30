/* eslint-disable no-empty-label */
'use strict';

const BasePage = require('./basePage.js');
const By = require('selenium-webdriver').By;

const SpeakerPage = Object.create(BasePage);

SpeakerPage.searchTest = function() {
  const idList = ['2330', '2240'];

  return this.commonSearchTest('Mario', idList);
};

SpeakerPage.jumpToTrack = function() {
  const self = this;
  const speakerId = '2330';
  const pageVertScrollOffset = 'return window.scrollY';

  const trackPromise =  new Promise(function(resolve) {
    self.find(By.id(speakerId)).then(function(elem) {
      self.driver.actions().mouseMove(elem).perform();
      elem.findElement(By.className('sessions')).findElement(By.css('a')).click().then(self.getPageUrl.bind(self))
        .then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function(height) {
            resolve(height > 0 && url.search('tracks') !== -1);
          });
        });
    });
  });

  return trackPromise;
};

SpeakerPage.jumpToSession = function() {
  const self = this;
  const speakerId = '53';
  const pageVertScrollOffset = 'return window.scrollY';

  const sessionPromise =  new Promise(function(resolve) {
    self.find(By.id(speakerId)).then(function(elem) {
      self.driver.actions().mouseMove(elem).perform();
      elem.findElement(By.className('sessions')).findElement(By.css('a')).click().then(self.getPageUrl.bind(self))
        .then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function() {
            resolve(url.search('session') !== -1);
          });
        });
    });
  });

  return sessionPromise;
};

SpeakerPage.hoverOverSpeaker = function() {
  const self = this;
  const speaker = 'speaker';
  const speakerDetailsDiv = 'speaker-social-icons';

  const promise = new Promise(function(resolve) {
    self.find(By.className(speaker)).click().then(self.driver.sleep(1000)).then(function() {
      const socialLinkPromise = self.getAllLinks(By.id(speakerDetailsDiv));

      socialLinkPromise.then(function(socialLinkArr) {
        const brokenLinks = self.countBrokenLinks(socialLinkArr.slice(0, 4));

        resolve(brokenLinks);
      });
    });
  });

  return promise;
};

module.exports = SpeakerPage;
