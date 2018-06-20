
'use strict';

const assert = require('chai').assert;
let generator = require('../src/backend/generator.js');
let app = require('../src/app');
let webdriver = require('selenium-webdriver');
let schedulePage = require('../src/selenium/schedulePage.js');
let generatorPage = require('../src/selenium/generatorPage');

describe('app', () => {
  describe('run', () => {
    it('should run app', () => {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 5000));
    });
  });
});

describe('generate', function () {
  describe('.create different event sites', function () {
    this.timeout(800000);

      it('should generate the FOSSASIA Summit 2017', function (done) {
        let data = {};

        data.body = {
          "email": "a@a.com",
          "theme": "light",
          "name": "Open Event",
          "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2017/",
          "datasource": "eventapi",
          "assetmode": "download",
        };

        generator.createDistDir(data, 'Socket', function (appFolder) {
          assert.equal(appFolder, "a@a.com/FOSSASIASummit2017");
          done();
        });

      });

      it('should generate the Mozilla All Hands 2017', function (done) {
        let data = {};

        data.body = {
          "email": "a@a.com",
          "theme": "light",
          "name": "Open Event",
          "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/MozillaAllHands17",
          "sessionMode": "single",
          "datasource": "eventapi",
          "assetmode": "download"
        };

        generator.createDistDir(data, 'Socket', function (appFolder) {
          assert.equal(appFolder, "a@a.com/MozillaAllHands2017");
          done();
        });

      });
  });
});

describe("Running Selenium tests on Chrome Driver", function () {
  this.timeout(600000);
  let driver;

  before(function () {
    if (process.env.SAUCE_USERNAME !== undefined) {
      driver = new webdriver.Builder()
        .usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
          .withCapabilities({
            'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
            build: process.env.TRAVIS_BUILD_NUMBER,
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
            browserName: "chrome",
            'chromeOptions': {
              prefs: {
                'downloads': {
                  'prompt_for_download': false
                }
              }
            }
          }).build();
    } else {
      driver = new webdriver.Builder()
        .withCapabilities({
          browserName: "chrome",
            'chromeOptions': {
              prefs: {
                'downloads': {
                  'prompt_for_download': false
                }
              }
          }
        }).build();
    }
  });

  after(function () {
    return driver.quit();
  });


  describe('Testing generator page', function () {

    before(function () {
      generatorPage.init(driver);
      generatorPage.visit('http://localhost:5000');
    });

    it('Checking for jsonUpload input section', function (done) {
      generatorPage.checkJsonInput().then(function (val) {
        assert.deepEqual(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking for eventAPI input section', function (done) {
      generatorPage.checkAPIendpointInput().then(function (val) {
        assert.deepEqual(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking for FTP input section', function (done) {
      generatorPage.checkFTPinput().then(function (val) {
        assert.deepEqual(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking for log Section', function (done) {
      generatorPage.checkBuildLogs().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking for Menu Section', function (done) {
      generatorPage.checkWebappMenu().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });

  describe('Testing schedule page', function () {

    before(function () {
      schedulePage.init(driver);
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/schedule.html');
    });

    it('Test for working of download buttons', function (done) {
      schedulePage.getDownloadDropdown().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Test for font color of sessions', function (done) {
      schedulePage.getSessionElemsColor().then(function (colorArr) {
        assert.deepEqual(colorArr, ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)']);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Check for Scrollbars', function (done) {
      let sizesArr = [[300, 600], [720, 600]];
      schedulePage.getScrollbarVisibility(sizesArr).then(function (statusArr) {
        schedulePage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking track name list appear near the top of page', function (done) {
      schedulePage.checkTrackNamePos().then(function (boolval) {
        assert.equal(boolval, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking alignment of date tab and session content', function (done) {
      schedulePage.checkAlignment().then(function (val) {
        assert.equal(val, 0);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking search functionality', function (done) {
      schedulePage.commonSearchTest().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, true, true, true, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    // Click on the session Elem to collapse
    it('Expanding the session', function (done) {
      schedulePage.toggleSessionElem().then(function (val) {
        assert.equal(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    // Click again to bring it back to default view
    it('Bring back the session to default view', function (done) {
      schedulePage.toggleSessionElem().then(function (val) {
        assert.deepEqual(val, false);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    //Now, we will do a series of tests to check the behaviour of the date divs when the date and mode is changed
    // First array gives the visibility of the date divs inside the list view container
    //Second array gives the visibility of the date divs inside the calendar view container

    //In default view, all the dates inside the list view must be visible. The calendar view container should not be shown
    it('Checking the default view of the page', function (done) {
      schedulePage.getCurrentView().then(function (arr) {
        assert.deepEqual(arr[0], [true, true, true]);
        assert.deepEqual(arr[1], [false, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Changing the date to Sunday', function (done) {
      schedulePage.changeDay(3).then(function (arr) {
        assert.deepEqual(arr[0], [false, false, true]);
        assert.deepEqual(arr[1], [false, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Changing the mode to Calendar', function (done) {
      schedulePage.toggleMode().then(function (arr) {
        assert.deepEqual(arr[0], [false, false, false]);
        assert.deepEqual(arr[1], [false, false, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Changing the date to Saturday in calendar mode itself', function (done) {
      schedulePage.changeDay(2).then(function (arr) {
        assert.deepEqual(arr[0], [false, false, false]);
        assert.deepEqual(arr[1], [false, true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Changing the mode back to list', function (done) {
      schedulePage.toggleMode().then(function (arr) {
        assert.deepEqual(arr[0], [false, true, false]);
        assert.deepEqual(arr[1], [false, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking Jump to Speaker functionality', function (done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/schedule.html');
      schedulePage.jumpToSpeaker().then(function (val) {
        assert.equal(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the working of social buttons', function (done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/schedule.html');
      schedulePage.checkSocialLinks().then(function (num) {
        assert.equal(num, 5);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function (done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/schedule.html');
      schedulePage.checkIsolatedBookmark().then(function (visArr) {
        assert.deepEqual(visArr, [false, true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking direct link for Rooms filter', function (done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/schedule.html#Balboa');
      schedulePage.checkFilterDirectLink().then(function (roomsArr) {
        assert.deepEqual(roomsArr, ["1078", "1079", "1080", "1081"]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking direct link for Tracks filter', function (done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/schedule.html#Meals%20w/%20Registered%20Guests');
      schedulePage.refresh();
      schedulePage.checkFilterDirectLink().then(function (TracksArr) {
        assert.deepEqual(TracksArr, ["1002", "1101", "1102"]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });
});
