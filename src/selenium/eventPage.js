var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var EventPage = Object.create(BasePage);

EventPage.getEventName = function() {
  return this.find(By.css('h1')).getText().then(function(name) {
    return name;
  });
};

module.exports = EventPage;
