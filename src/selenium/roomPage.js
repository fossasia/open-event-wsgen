var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var RoomPage = Object.create(BasePage);

RoomPage.checkIsolatedBookmark = function() {

  // We go into starred mode and unmark sessions having id 3015 which was marked previously on tracks pages. If the bookmark feature works, then length of the web page would decrease.

  var getPageHeight = 'return document.body.scrollHeight';
  var sessionIdsArr = ['3015'];
  var self = this;
  var oldHeight, newHeight;

  return self.toggleStarredButton().then(function() {
    return self.driver.executeScript(getPageHeight).then(function(height) {
      oldHeight = height;
      return self.toggleSessionBookmark(sessionIdsArr).then(function() {
        return self.driver.executeScript(getPageHeight).then(function(height) {
          newHeight = height;
          return oldHeight > newHeight;
        });
      });
    });
  });
};

RoomPage.toggleSessionElem = function() {
  var self = this;

  // Checking the toggle behaviour of session having id 3014
  var promise = new Promise(function(resolve) {
    self.find(By.id('title-3014')).then(self.click).then(self.driver.sleep(1000)).then(function() {
      var promiseArr = [];
      promiseArr.push(self.find(By.id('desc-3014')).isDisplayed());
      promiseArr.push(self.find(By.id('desc2-3014')).isDisplayed());
      resolve(Promise.all(promiseArr));
    });
  });

  return promise;
};

RoomPage.searchThenStarredMode = function() {
  var self = this;
  var idArr = ['3014', '2861', '3015'];
  var promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  return self.search('wel').then(self.toggleStarredButton.bind(self)).then(self.getElemsDisplayStatus.bind(null, promiseArr));
};

RoomPage.starredModeThenSearch = function() {
  var self = this;
  var idArr = ['3014', '2861', '3015'];
  var promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  return self.toggleStarredButton().then(self.search.bind(self, 'wel')).then(self.getElemsDisplayStatus.bind(null, promiseArr));
};

module.exports = RoomPage;
