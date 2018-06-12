/* eslint-disable no-empty-label */
'use strict';

var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;

var RoomPage = Object.create(BasePage);

RoomPage.checkIsolatedBookmark = function() {
  var self = this;
  var bookmarkSessionsIdsArr = ['3014'];
  var visibleCheckSessionsIdsArr = ['3014', '3015', '2918'];

  return self.bookmarkCheck(bookmarkSessionsIdsArr, visibleCheckSessionsIdsArr);
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

RoomPage.checkRoomFilterDirectLink = function() {
  var self = this;
  var roomIdArr = [];

  function pushId(roomElement) {
    roomElement.getAttribute('id').then(function(id) {
      roomIdArr.push(id);
    });
  }

  return new Promise(function(resolve) {
    self.findAll(By.className('room-filter')).then(function(roomElems) {
      roomElems.forEach(function(roomElem) {
        roomElem.isDisplayed().then(function(val) {
          if (val === true) {
            pushId(roomElem);
          }
        });
      });
    }).then(function() {
      resolve(roomIdArr);
    });
  });
};

module.exports = RoomPage;
