/* eslint-disable no-empty-label */
'use strict';

const BasePage = require('./basePage.js');
const By = require('selenium-webdriver').By;

const cocPage = Object.create(BasePage);

cocPage.checkCoCsection = function() {
  return this.find(By.className('coc'));
};

module.exports = cocPage;
