var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var GeneratorPage = {
  init: function (webdriver) {
    this.driver = webdriver;
  },

  visit: function (url) {
    return this.driver.get(url);
  },

  find: function (locator, timeout) {
    var waitTime = timeout || 20000;
    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElement(locator);
  },

  findAll: function (locator, timeout) {
    var waitTime = timeout || 20000;
    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElements(locator);
  }
};

GeneratorPage.checkJsonInput = function () {
  var self = this;
  var inputJsonId = 'jsonupload-input';
  var promise = new Promise(function (resolve) {
    self.find(By.id('jsonupload')).click().then(self.driver.sleep(1000)).then(function () {
      resolve(self.find(By.id(inputJsonId)).isDisplayed());
    });
  });
  return promise;
};

GeneratorPage.checkAPIendpointInput = function () {
  var self = this;
  var inputAPIid = 'eventapi-input';
  var promise = new Promise(function (resolve) {
    self.find(By.id('eventapi')).click().then(self.driver.sleep(1000)).then(function () {
      resolve(self.find(By.id(inputAPIid)).isDisplayed());
    });
  });
  return promise;
};

GeneratorPage.checkFTPinput = function () {
  var self = this;
  var inputFTPid = 'upload-ftp-details';
  var promise = new Promise(function (resolve) {
    self.find(By.id('upload-ftp')).click().then(self.driver.sleep(1000)).then(function () {
      resolve(self.find(By.id(inputFTPid)).isDisplayed());
    });
  });
  return promise;
};

GeneratorPage.checkBuildLogs = function () {
  var self = this;
  var LogSectionId = 'buildLog';
  var promiseArr = [];
  var promise = new Promise(function (resolve) {
    self.find(By.id('aLog')).click().then(self.driver.sleep(1000)).then(function () {
      promiseArr.push(self.find(By.id(LogSectionId)).isDisplayed());
    }).then(function () {
      self.find(By.id('aLog')).click().then(self.driver.sleep(1000)).then(function () {
        promiseArr.push(self.find(By.id(LogSectionId)).isDisplayed());
        resolve(Promise.all(promiseArr));
      });
    });
  });
  return promise;
};

GeneratorPage.checkWebappMenu = function () {
  var self = this;
  var MenuClass = 'custom-menu-cont';
  var promiseArr = [];
  var promise = new Promise(function (resolve) {
    self.find(By.className('custom-menubutton')).click().then(self.driver.sleep(1000)).then(function () {
      promiseArr.push(self.find(By.className(MenuClass)).isDisplayed());
    }).then(function () {
      self.find(By.className('custom-menubutton')).click().then(self.driver.sleep(1000)).then(function () {
        promiseArr.push(self.find(By.className(MenuClass)).isDisplayed());
        resolve(Promise.all(promiseArr));
      });
    });
  });
  return promise;
};

module.exports = GeneratorPage;

