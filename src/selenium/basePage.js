/* eslint-disable no-empty-label */
'use strict';

const until = require('selenium-webdriver').until;
const By = require('selenium-webdriver').By;
const request = require('request');

const BasePage = {

  init: function(webdriver) {
    this.driver = webdriver;
  },

  visit: function(url) {
    return this.driver.get(url);
  },

  refresh: function() {
    return this.driver.navigate().refresh();
  },

  find: function(locator, timeout) {
    const waitTime = timeout || 20000;

    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElement(locator);
  },

  findAll: function(locator, timeout) {
    const waitTime = timeout || 20000;

    this.driver.wait(until.elementLocated(locator, waitTime));
    return this.driver.findElements(locator);
  },

  getColor: function(el) {
    const element = el || this;

    return element.getAttribute('color');
  },

  click: function(el) {
    return el.click();
  },

  toggleStarredButton: function() {
    return this.find(By.id('starred')).then(this.click);
  },

  toggleSessionBookmark: function(sessionIds) {
    const self = this;
    const promiseArr = [];

    sessionIds.forEach(function(sessionId) {
      const promElem = new Promise(function(resolve, reject) {
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
    const promiseArr = [];

    arr.forEach(function(elem) {
      promiseArr.push(elem.isDisplayed());
    });
    return Promise.all(promiseArr);
  },

  getSessionElemsColor: function() {
    const self = this;
    const sessionElemIdArr = ['title-3014', 'title-2941'];
    const colorPromArr = sessionElemIdArr.map(function(sessionElemId) {
      return self.find(By.id(sessionElemId)).getCssValue('color');
    });

    return Promise.all(colorPromArr);
  },

  checkDownButton: function() {
    const self = this;

    return self.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)').then(self.find.bind(self, By.id('down-button'))).then(function(el) {
      return el.click().then(self.driver.sleep(1000)).then(function() {
        return self.driver.executeScript('return window.scrollY');
      });
    });
  },

  search: function(text) {
    const self = this;
    const searchClass = 'fossasia-filter';

    // There are two search input box with the class fossasia-filter. One of them is for mobile view and other is for bigger
    // screens. We are doing this test on bigger screen so we have to select that input element and enter text in it. The second
    // input element is for the bigger screens so working with it

    return self.findAll(By.className(searchClass)).then(function(inputArr) {
      return inputArr[1].sendKeys(text);
    });
  },

  commonSearchTest: function(text, idList) {
    const self = this;
    const searchText = text || 'Mario';

    // First 4 session ids should show up on default search text and the last two not
    const arrId = idList || ['3017', '3029', '3013', '3031', '3014', '3015'];

    const promise = new Promise(function(resolve) {
      self.search(searchText).then(function() {
        const promiseArr = arrId.map(function(curElem) {
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
    const self = this;
    const searchClass = 'fossasia-filter';

    return self.findAll(By.className(searchClass)).then(function(inputArr) {
      return inputArr[1].clear();
    });
  },

  countOnesInArray: function(arr) {
    return arr.reduce(function(counter, value) {
      return value === 1 || value === 'true' ? counter + 1 : counter;
    }, 0);
  },

  getAllLinks: function(locator) {
    function linksFromAnchorTags(anchorTags) {
      const promiseArr = anchorTags.map(function(anchor) {
        return anchor.getAttribute('href');
      });

      return Promise.all(promiseArr);
    }

    return this.find(locator).then(function(el) {
      return el.findElements(By.tagName('a')).then(linksFromAnchorTags);
    });
  },

  countBrokenLinks: function(links) {
    return new Promise(function(resolve) {
      let brokenLinks = 0;
      let counter = 0;

      links.forEach(function(link) {
        request(link, function(error, response) {
          counter += 1;
          if (error || response.statusCode === 404) {
            brokenLinks++;
          }
          if (counter === links.length) {
            resolve(brokenLinks);
          }
        });
      });
    });
  },

  getPageUrl: function() {
    return this.driver.getCurrentUrl();
  },

  jumpToSpeaker: function() {
    const self = this;
    const sessionTitleId = 'title-3014';
    const sessionDetailId = 'desc-3014';
    const pageVertScrollOffset = 'return window.scrollY';

    return new Promise(function(resolve) {
      self.find(By.id(sessionTitleId)).then(self.click).then(function() {
        self.find(By.id(sessionDetailId)).findElement(By.css('a')).click().then(self.getPageUrl.bind(self)).then(function(url) {
          self.driver.executeScript(pageVertScrollOffset).then(function(height) {
            resolve(height > 0 && url.search('speakers') !== -1);
          });
        });
      });
    });
  },

  resizeWindow: function(width, height) {
    return this.driver.manage().window().setSize(width, height);
  },

  checkScrollbar: function() {
    const scrollVisible =  'return document.documentElement.scrollWidth > document.documentElement.clientWidth';

    return this.driver.executeScript(scrollVisible);
  },

  justSleep: function(duration) {
    return this.driver.sleep(duration);
  },

  getVerticalOffset: function() {
    const pageVertScrollOffset = 'return window.scrollY';

    return this.driver.executeScript(pageVertScrollOffset);
  },

  goToTop: function() {
    const self = this;
    const sleepDuration = 1000;

    return self.find(By.id('down-button')).click().then(function() {
      return self.driver.sleep(sleepDuration);
    });
  },

  subnavbarStatus: function(day) {
    const self = this;
    const tabSelectClass = 'tabs-nav-link';
    const tabLinkContainerClass = 'tab-content';
    const sleepDuration = 1000;

    const subnavbarPromise = new Promise(function(resolve) {
      self.findAll(By.className(tabSelectClass)).then(function(dayElems) {
        dayElems[day - 1].click().then(function() {
          self.findAll(By.className(tabLinkContainerClass)).then(function(linkContainer) {
            linkContainer[day - 1].findElements(By.css('a')).then(function(linksArr) {
              linksArr[linksArr.length - 1].click().then(self.justSleep.bind(self, sleepDuration))
                .then(self.getVerticalOffset.bind(self)).then(function(height) {
                  self.goToTop().then(function() {
                    resolve(height > 0);
                  });
                });
            });
          });
        });
      });
    });

    return subnavbarPromise;
  },

  checkAllSubnav: function() {
    const self = this;
    const promiseArr = [];
    let counter = 1;
    const days = 3;

    while (counter <= days) {
      promiseArr.push(self.subnavbarStatus(counter));
      counter += 1;
    }
    return Promise.all(promiseArr);
  },

  getScrollbarVisibility: function(sizeList) {
    const promiseArr = [];
    const self = this;

    sizeList.forEach(function(size) {
      promiseArr.push(self.resizeWindow(size[0], size[1]).then(self.checkScrollbar.bind(self)));
    });
    return Promise.all(promiseArr);
  },

  getPos: function(el) {
    return el.getLocation();
  },

  checkTrackNamePos: function() {
    const self = this;

    return self.find(By.className('track-room-names')).then(self.getPos).then(function(posObj) {
      return posObj.y < 2000;
    });
  },

  checkAlignment: function() {
    const self = this;
    const posPromArr = [];

    posPromArr.push(self.find(By.id('tabs')).then(self.getPos));
    posPromArr.push(self.find(By.className('text')).then(self.getPos));

    const checkAlign = new Promise(function(resolve) {
      Promise.all(posPromArr).then(function(posArr) {
        resolve(Math.abs(posArr[0].x - posArr[1].x));
      });
    });

    return checkAlign;
  },

  bookmarkCheck: function(sessionToggleArr, visCheckSessionArr) {
    const self = this;
    const sessionElemArr = visCheckSessionArr.map(function(id) {
      return self.find(By.id(id));
    });

    return self.toggleSessionBookmark(sessionToggleArr).then(function() {
      return self.driver.executeScript('window.scrollTo(0, 0)').then(self.toggleStarredButton.bind(self)).then(self.getElemsDisplayStatus.bind(null, sessionElemArr));
    });
  },

  getAllWindows: function() {
    return this.driver.getAllWindowHandles();
  },

  closeOtherWindows: function(windowArr, baseWindow) {
    // Close all other windows and switch to the base window
    const self = this;
    const closeWindowProm = windowArr.map(function(windowElem) {
      return self.driver.switchTo().window(windowElem).then(function() {
        return self.driver.close();
      });
    });

    return Promise.all(closeWindowProm).then(function() {
      return self.driver.switchTo().window(baseWindow);
    });
  },

  getSocialButtonElems: function() {
    // Returns social button elements of a particular session
    const sessionId = '3014';
    const socialToggleClass = 'session-lin';
    const socialButtonClass = 'social-button';
    const self = this;

    const socialButtonProm = new Promise(function(resolve) {
      self.find(By.id(sessionId)).then(function(el) {
        self.click(el).then(function() {
          el.findElement(By.className(socialToggleClass)).click().then(function() {
            resolve(el.findElements(By.className(socialButtonClass)));
          });
        });
      });
    });

    return socialButtonProm;
  },

  checkSocialLinks: function() {
    // Returns the number of social button links of a session which are working properly
    const self = this;
    let baseWindow;

    self.driver.getWindowHandle().then(function(windowElem) {
      baseWindow = windowElem;
    });

    const socialPromise = new Promise(function(resolve) {
      self.getSocialButtonElems().then(function(socialArr) {
        const windowPromArr = socialArr.map(function(linkElem) {
          return linkElem.click();
        });

        Promise.all(windowPromArr).then(self.getAllWindows.bind(self)).then(function(windowArr) {
          const len = windowArr.length;

          windowArr.splice(windowArr.indexOf(baseWindow), 1);
          self.closeOtherWindows(windowArr, baseWindow).then(function() {
            resolve(len);
          });
        });
      });
    });

    return socialPromise;
  }
};

module.exports = BasePage;
