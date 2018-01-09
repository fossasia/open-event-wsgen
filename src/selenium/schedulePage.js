var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var SchedulePage = Object.create(BasePage);
var datesId = ['2017-03-17', '2017-03-18', '2017-03-19'];

SchedulePage.checkIsolatedBookmark = function() {
  var self = this;
  var bookmarkSessionsIdsArr = ['3015'];
  var visibleCheckSessionsIdsArr = ['3014', '3015', '2918'];

  return self.bookmarkCheck(bookmarkSessionsIdsArr, visibleCheckSessionsIdsArr);
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

SchedulePage.toggleMode = function() {
  var self = this;
  var toggleButtonId = 'page-mode';

  return self.find(By.id(toggleButtonId)).then(self.click).then(self.getCurrentView.bind(self));
};

module.exports = SchedulePage;

