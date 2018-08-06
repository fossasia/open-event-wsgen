/* eslint-disable no-empty-label */
'use strict';

const BasePage = require('./basePage.js');
const By = require('selenium-webdriver').By;

const EventPage = Object.create(BasePage);

EventPage.getEventName = function() {
  return this.find(By.css('h1')).getText().then(function(name) {
    return name;
  });
};

EventPage.checkTweetSection = function() {
  // This will return an error if the tweet section is not there
  return this.find(By.id('tweet'));
};

EventPage.getNavbarFooterBrokenLinks = function() {
  // Both the promises return an array of links contained inside the container
  const navbarPromise = this.getAllLinks(By.className('navbar-default'));
  const footerPromise = this.getAllLinks(By.className('footer-container'));

  const promiseArr = [];

  promiseArr.push(navbarPromise);
  promiseArr.push(footerPromise);

  // Merges two arrays into one and remove duplicate elements
  function mergeUniqueArr(arr1, arr2) {
    return arr1.concat(arr2.filter(function(item) {
      return arr1.indexOf(item) === -1;
    }));
  }

  // Returns a promise which resolves to the unique list of elements in navbar and footer
  function getUniqueLinks() {
    return new Promise(function(resolve) {
      Promise.all(promiseArr).then(function(allLinksArr) {
        resolve(mergeUniqueArr(allLinksArr[0], allLinksArr[1]));
      });
    });
  }

  return getUniqueLinks().then(this.countBrokenLinks);
};

EventPage.checkSponsorSection = function() {
  return this.find(By.className('sponsorscont'));
};

EventPage.getSponsorsBrokenLinks = function() {
  const allLinks = this.getAllLinks(By.className('sponsorscont'));
  const brokenLinks = allLinks.then(this.countBrokenLinks);

  return brokenLinks;
};

EventPage.checkTicketButton = function() {
  return this.find(By.id('ticket-button'));
};

EventPage.checkTicketFunctionality = function() {
  const link = this.getAllLinks(By.className('ticket-button-container'));
  const brokenLinks = link.then(this.countBrokenLinks);

  return brokenLinks;
};
module.exports = EventPage;
