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

module.exports = RoomPage;
