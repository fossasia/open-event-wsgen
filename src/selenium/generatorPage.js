/* eslint-disable no-empty-label */
'use strict';

var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var GeneratorPage = {
  init: function(webdriver) {
    this.driver = webdriver;
  },

  visit: function(url) {
    return this.driver.get(url);
  },

  find: function(locator, timeout) {
    var waitTime = timeout || 20000;

    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElement(locator);
  },

  findAll: function(locator, timeout) {
    var waitTime = timeout || 20000;

    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElements(locator);
  }
};

// Checks if json upload section appears on selecting json-upload as a choice for input data

GeneratorPage.checkJsonInput = function() {
  var self = this;
  var inputJsonId = 'jsonupload-input';
  var promise = new Promise(function(resolve) {
    self.find(By.id('jsonupload')).click().then(self.driver.sleep(1000)).then(function() {
      resolve(self.find(By.id(inputJsonId)).isDisplayed());
    });
  });

  return promise;
};

// Checks if API endpoint section appears on selecting API-endpoint as a choice for input data

GeneratorPage.checkAPIendpointInput = function() {
  var self = this;
  var inputAPIid = 'eventapi-input';
  var promise = new Promise(function(resolve) {
    self.find(By.id('eventapi')).click().then(self.driver.sleep(1000)).then(function() {
      resolve(self.find(By.id(inputAPIid)).isDisplayed());
    });
  });

  return promise;
};

// Checks if ftp-details section appears on choosing ftp-upload.

GeneratorPage.checkFTPinput = function() {
  var self = this;
  var inputFTPid = 'upload-ftp-details';
  var promise = new Promise(function(resolve) {
    self.find(By.id('upload-ftp')).click().then(self.driver.sleep(1000)).then(function() {
      resolve(self.find(By.id(inputFTPid)).isDisplayed());
    });
  });

  return promise;
};

// Checks if logs are displayed on clicking the logs link.

GeneratorPage.checkBuildLogs = function() {
  var self = this;
  var LogSectionId = 'buildLog';
  var promiseArr = [];
  var promise = new Promise(function(resolve) {
    self.find(By.id('aLog')).click().then(self.driver.sleep(1000)).then(function() {
      promiseArr.push(self.find(By.id(LogSectionId)).isDisplayed());
    }).then(function() {
      self.find(By.id('aLog')).click().then(self.driver.sleep(1000)).then(function() {
        promiseArr.push(self.find(By.id(LogSectionId)).isDisplayed());
        resolve(Promise.all(promiseArr));
      });
    });
  });

  return promise;
};

// Checks if the webapp menu appear on clicking the option to see sister projects.

GeneratorPage.checkWebappMenu = function() {
  var self = this;
  var MenuClass = 'custom-menu-cont';
  var promiseArr = [];
  var promise = new Promise(function(resolve) {
    self.find(By.className('custom-menubutton')).click().then(self.driver.sleep(1000)).then(function() {
      promiseArr.push(self.find(By.className(MenuClass)).isDisplayed());
    }).then(function() {
      self.find(By.className('custom-menubutton')).click().then(self.driver.sleep(1000)).then(function() {
        promiseArr.push(self.find(By.className(MenuClass)).isDisplayed());
        resolve(Promise.all(promiseArr));
      });
    });
  });

  return promise;
};

module.exports = GeneratorPage;

