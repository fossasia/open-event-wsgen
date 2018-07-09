/* eslint-disable no-empty-label */
'use strict';

const BasePage = require('./basePage.js');
const By = require('selenium-webdriver').By;

const RoomPage = Object.create(BasePage);

RoomPage.checkIsolatedBookmark = function() {
  const self = this;
  const bookmarkSessionsIdsArr = ['3014'];
  const visibleCheckSessionsIdsArr = ['3014', '3015', '2918'];

  return self.bookmarkCheck(bookmarkSessionsIdsArr, visibleCheckSessionsIdsArr);
};

RoomPage.toggleSessionElem = function() {
  const self = this;

  // Checking the toggle behaviour of session having id 3014
  const promise = new Promise(function(resolve) {
    self.find(By.id('title-3014')).then(self.click).then(self.driver.sleep(1000)).then(function() {
      const promiseArr = [];

      promiseArr.push(self.find(By.id('desc-3014')).isDisplayed());
      promiseArr.push(self.find(By.id('desc2-3014')).isDisplayed());
      resolve(Promise.all(promiseArr));
    });
  });

  return promise;
};

RoomPage.searchThenStarredMode = function() {
  const self = this;
  const idArr = ['3014', '2861', '3015'];
  const promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  return self.search('wel').then(self.toggleStarredButton.bind(self)).then(self.getElemsDisplayStatus.bind(null, promiseArr));
};

RoomPage.starredModeThenSearch = function() {
  const self = this;
  const idArr = ['3014', '2861', '3015'];
  const promiseArr = idArr.map(function(elem) {
    return self.find(By.id(elem));
  });

  return self.toggleStarredButton().then(self.search.bind(self, 'wel')).then(self.getElemsDisplayStatus.bind(null, promiseArr));
};

RoomPage.checkRoomFilterDirectLink = function() {
  const self = this;
  const roomIdArr = [];

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

RoomPage.checkFilterDynamicLink = function() {
  const self = this;
  const promiseArr = [];

  promiseArr.push(self.activeRooms());
  promiseArr.push(self.activeTracks());
  return Promise.all(promiseArr);
};

module.exports = RoomPage;
