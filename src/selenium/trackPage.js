var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var TrackPage = Object.create(BasePage);

TrackPage.getNoOfVisibleSessionElems = function() {
  return this.findAll(By.className('room-filter')).then(this.getElemsDisplayStatus).then(function(displayArr) {
    return displayArr.reduce(function(counter, value) { return value == 1 ? counter + 1 : counter; }, 0);
  });
};

TrackPage.checkIsolatedBookmark = function() {
  // Sample sessions having ids of 3014 and 3015 being checked for the bookmark feature
  var sessionIdsArr = ['3014', '3015'];
  var self = this;

  // Bookmark the sessions, scrolls down the page and then count the number of visible session elements
  return self.toggleSessionBookmark(sessionIdsArr).then(self.toggleStarredButton.bind(self)).then(function() {
    return self.driver.executeScript('window.scrollTo(0, 400)').then(self.getNoOfVisibleSessionElems.bind(self));
  });
};


TrackPage.toggleSessionElem = function() {
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

module.exports = TrackPage;
