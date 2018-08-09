/* eslint-disable no-empty-label */
'use strict';

const BasePage = require('./basePage.js');
const By = require('selenium-webdriver').By;

const SchedulePage = Object.create(BasePage);
const datesId = ['2017-03-17', '2017-03-18', '2017-03-19'];

SchedulePage.checkIsolatedBookmark = function() {
  const self = this;
  const bookmarkSessionsIdsArr = ['3015'];
  const visibleCheckSessionsIdsArr = ['3014', '3015', '2918'];

  return self.bookmarkCheck(bookmarkSessionsIdsArr, visibleCheckSessionsIdsArr);
};

SchedulePage.toggleSessionElem = function() {
  const self = this;
  // Checking the toggle behaviour of session having id 3014
  const promise = new Promise(function(resolve) {
    self.find(By.id('title-3014')).then(self.click).then(self.driver.sleep(1000)).then(function() {
      resolve(self.find(By.id('desc-3014')).isDisplayed());
    });
  });

  return promise;
};

SchedulePage.getVisibleDates = function(mode) {
  const self = this;

  if (mode === 'list') {
    return self.find(By.className('list-view')).findElements(By.className('day-filter')).then(self.getElemsDisplayStatus);
  } else if (mode === 'calendar') {
    return self.find(By.className('calendar-view')).findElements(By.className('calendar')).then(self.getElemsDisplayStatus);
  }

  return null;
};

SchedulePage.getCurrentView = function() {
  // Gives the current status about visibility of the date divs inside the list and the calendar container
  const promiseArr = [];

  promiseArr.push(this.getVisibleDates('list'));
  promiseArr.push(this.getVisibleDates('calendar'));
  return Promise.all(promiseArr);
};

SchedulePage.changeDay = function(dayNo) {
  const self = this;
  const dateId = datesId[dayNo - 1];

  return self.find(By.id(dateId)).then(self.click).then(self.getCurrentView.bind(self));
};

SchedulePage.toggleMode = function() {
  const self = this;
  const toggleButtonId = 'page-mode';

  return self.find(By.id(toggleButtonId)).then(self.click).then(self.getCurrentView.bind(self));
};

SchedulePage.getDownloadDropdown = function() {
  const self = this;
  const promiseArr = [];

  const clickDropdownButton = function() {
    return self.find(By.css('.filter.dropdown .fa-download')).then(function(icon) {
      return icon.findElement(By.xpath('..'));
    }).then(function(button) {
      return button.click().then(self.driver.sleep(1000));
    });
  };

  return Promise.resolve().then(function() {
    return clickDropdownButton();
  }).then(function() {
    promiseArr.push(self.find(By.className('download-dropdown')).isDisplayed());
  }).then(function() {
    return clickDropdownButton();
  }).then(function() {
    promiseArr.push(self.find(By.className('download-dropdown')).isDisplayed());
  }).then(function() {
    return Promise.all(promiseArr);
  });
};

SchedulePage.checkFilterDirectLink = function() {
  const self = this;
  const roomTrackIdArr = [];

  function pushId(roomTrackElem) {
    roomTrackElem.getAttribute('id').then(function(id) {
      roomTrackIdArr.push(id);
    });
  }

  return new Promise(function(resolve) {
    self.findAll(By.className('schedule-track')).then(function(roomTrackElems) {
      roomTrackElems.forEach(function(roomTrackElem) {
        roomTrackElem.isDisplayed().then(function(val) {
          if (val === true) {
            pushId(roomTrackElem);
          }
        });
      });
    }).then(function() {
      resolve(roomTrackIdArr);
    });
  });
};

SchedulePage.checkFilterDynamicLink = function() {
  const self = this;
  const promiseArr = [];

  promiseArr.push(self.activeRooms());
  promiseArr.push(self.activeTracks());
  return Promise.all(promiseArr);
};

SchedulePage.checkVideo = function() {
  const self = this;

  return new Promise(function(resolve) {
    self.find(By.id('title-3015')).then(self.click).then(function() {
      self.find(By.id('video-3015')).then(function(elem) {
        elem.getAttribute('src').then(function(url) {
          resolve(self.isLinkBroken(url));
        });
      });
    });
  });
};

module.exports = SchedulePage;

