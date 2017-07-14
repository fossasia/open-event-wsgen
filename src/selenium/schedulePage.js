var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var SchedulePage = Object.create(BasePage);

SchedulePage.checkIsolatedBookmark = function() {

  // We go into starred mode and unmark sessions having id 3014 which was marked previously on tracks pages. If the bookmark feature works, then length of the web page would decrease.

  var self = this;
  var getPageHeight = 'return document.body.scrollHeight';
  var sessionIdsArr = ['3014'];
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

SchedulePage.toggleSessionElem = function() {
  var self = this;

  // Checking the toggle behaviour of session having id 3014
  var promise = new Promise(function(resolve) {
    self.find(By.id('title-3014')).then(self.click).then(self.driver.sleep(1000)).then(function() {
      resolve(self.find(By.id('desc-3014')).isDisplayed());
    });
  });

  return promise;
};

module.exports = SchedulePage;

