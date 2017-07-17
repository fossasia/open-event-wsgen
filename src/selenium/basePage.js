var until = require('selenium-webdriver').until;
var By = require('selenium-webdriver').By;

var BasePage = {

  init: function(webdriver) {
    this.driver = webdriver;
  },

  visit: function(url) {
    return this.driver.get(url);
  },

  find: function(locator, timeout) {
    var waitTime = timeout || 20000;
    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElement(locator);
  },

  findAll: function(locator, timeout) {
    var waitTime = timeout || 20000;
    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElements(locator);
  },

  getColor: function(el) {
    var element = el || this;
    return element.getAttribute('color');
  },

  click: function(el) {
    return el.click();
  },

  toggleStarredButton: function() {
    return this.find(By.id('starred')).then(this.click);
  },

  toggleSessionBookmark: function(sessionIds) {
    var self = this;
    var promiseArr = [];

    sessionIds.forEach(function(sessionId) {
      var promElem = new Promise(function(resolve, reject) {
        self.find(By.id(sessionId)).then(function(el) {
          el.findElement(By.className('bookmark')).then(self.click).then(function() {
            resolve('done');
          });
        });
      });

      promiseArr.push(promElem);
    });

    return Promise.all(promiseArr);
  },

  getElemsDisplayStatus: function(arr) {
    var promiseArr = [];

    arr.forEach(function(elem) {
      promiseArr.push(elem.isDisplayed());
    });
    return Promise.all(promiseArr);
  },

  checkDownButton: function() {
    var self = this;

    return self.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)').then(self.find.bind(self, By.id('down-button'))).then(function(el) {
      return el.click().then(self.driver.sleep(1000)).then(function() {
        return self.driver.executeScript('return window.scrollY');
      });
    });
  },

  search: function(text) {
    return this.find(By.className('fossasia-filter')).sendKeys(text);
  },

  commonSearchTest: function(text, idList) {
    var self = this;
    var searchText = text || 'Mario';

    // First 4 session ids should show up on default search text and the last two not
    var arrId = idList || ['3017', '3029', '3013', '3031', '3014', '3015'];

    var promise = new Promise(function(resolve) {
      self.search(searchText).then(function() {
        var promiseArr = arrId.map(function(curElem) {
          return self.find(By.id(curElem)).isDisplayed();
        });

        self.resetSearchBar().then(function() {
          resolve(Promise.all(promiseArr));
        });
      });
    });

    return promise;
  },

  resetSearchBar: function() {
    return this.find(By.className('fossasia-filter')).clear();
  },

  countOnesInArray: function(arr) {
    return arr.reduce(function(counter, value) { return value == 1 ? counter + 1 : counter; }, 0);
  }

};

module.exports = BasePage;
