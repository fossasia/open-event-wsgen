var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var SchedulePage = Object.create(BasePage);
var datesId = ['2017-03-17', '2017-03-18', '2017-03-19'];

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

SchedulePage.getVisibleDates = function(mode) {
  var self = this;

  if (mode == 'list') {
    return self.find(By.className('list-view')).findElements(By.className('day-filter')).then(self.getElemsDisplayStatus);
  }
  else if (mode == 'calendar') {
    return self.find(By.className('calendar-view')).findElements(By.className('calendar')).then(self.getElemsDisplayStatus);
  }
};

SchedulePage.getCurrentView = function() {
  // Gives the current status about visibility of the date divs inside the list and the calendar container
  var promiseArr = [];
  promiseArr.push(this.getVisibleDates('list'));
  promiseArr.push(this.getVisibleDates('calendar'));
  return Promise.all(promiseArr);
};

SchedulePage.changeDay = function(dayNo) {
  var self = this;
  var dateId = datesId[dayNo - 1];
  return self.find(By.id(dateId)).then(self.click).then(self.getCurrentView.bind(self));
};

SchedulePage.changeMode = function(mode) {
  var self = this;
  return self.find(By.id(mode)).then(self.click).then(self.getCurrentView.bind(self));
};

module.exports = SchedulePage;

