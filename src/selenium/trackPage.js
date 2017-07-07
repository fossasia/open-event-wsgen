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

  return this.toggleSessionBookmark(sessionIdsArr).then(this.toggleStarredButton.bind(this)).then(this.getNoOfVisibleSessionElems.bind(this));
};

module.exports = TrackPage;
