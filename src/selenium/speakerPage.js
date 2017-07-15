var BasePage = require('./basePage.js');
var By = require('selenium-webdriver').By;
var until = require('selenium-webdriver').until;

var SpeakerPage = Object.create(BasePage);

SpeakerPage.searchTest = function() {
  var idList = ['2330', '2240'];
  return this.commonSearchTest('Mario', idList);
};


module.exports = SpeakerPage;
