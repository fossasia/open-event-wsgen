var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;

var SpeakerPage = Object.create(BasePage);

SpeakerPage.searchTest = function() {
  var idList = ['2330', '2240'];

  return this.commonSearchTest('Mario', idList);
};

SpeakerPage.jumpToTrack = function() {
  var self = this;
  var speakerId = '2330';
  var pageVertScrollOffset = 'return window.scrollY';

  var trackPromise =  new Promise(function(resolve) {
    self.find(By.id(speakerId)).then(function(elem) {
      self.driver.actions().mouseMove(elem).perform();
      elem.findElement(By.className('sessions')).findElement(By.css('a')).click().then(self.getPageUrl.bind(self))
        .then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function(height) {
            resolve(height > 0 && (url.search('tracks') !== -1));
        });
      });
    });
  });

  return trackPromise;
};

SpeakerPage.jumpToSession = function() {
  var self = this;
  var speakerId = '53';
  var pageVertScrollOffset = 'return window.scrollY';

  var sessionPromise =  new Promise(function(resolve) {
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
  var self = this;
  var speaker = 'speaker';
  var speakerDetailsDiv = 'speaker-social-icons';

  var promise = new Promise(function(resolve) {
    self.find(By.className(speaker)).click().then(self.driver.sleep(1000)).then(function() {
      var socialLinkPromise = self.getAllLinks(By.id(speakerDetailsDiv));
      
      socialLinkPromise.then(function(socialLinkArr) {
        var brokenLinks = self.countBrokenLinks(socialLinkArr.slice(0, 4));
        
        resolve(brokenLinks);
      });
    });
  });

  return promise;
};

module.exports = SpeakerPage;
