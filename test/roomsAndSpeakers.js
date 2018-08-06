
'use strict';

const assert = require('chai').assert;
let generator = require('../src/backend/generator.js');
let app = require('../src/app');
let webdriver = require('selenium-webdriver');
let speakerPage = require('../src/selenium/speakerPage.js');
let roomPage = require('../src/selenium/roomPage.js');

describe('app', () => {
  describe('run', () => {
    it('should run app', () => {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 5000));
    });
  });
});

describe('generate', function() {
  describe('.create different event sites', function() {
    this.timeout(800000);

    it('should generate the FOSSASIA Summit 2017', function(done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "theme": "light",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2017/",
        "datasource": "eventapi",
        "assetmode": "download",
        "gcalendar": {
          'id': process.env.gcalendar_id,
          'key': process.env.gcalendar_key
        }
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2017");
        done();
      });

    });

    it('should generate the Mozilla All Hands 2017', function(done) {
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

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/MozillaAllHands2017");
        done();
      });

    });

  });
});

describe("Running Selenium tests on Chrome Driver", function() {
  this.timeout(600000);
  let driver;

  before(function() {
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

  after(function() {
    return driver.quit();
  });

  describe('Testing rooms page', function() {
    before(function() {
      roomPage.init(driver);
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
    });

    it('Test for font color of sessions', function(done) {
      roomPage.getSessionElemsColor().then(function(colorArr) {
        assert.deepEqual(colorArr, ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)']);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Check for Scrollbars', function(done) {
      let sizesArr = [
        [300, 600],
        [720, 600]
      ];
      roomPage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        roomPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking track name list appear near the top of page', function(done) {
      roomPage.checkTrackNamePos().then(function(boolval) {
        assert.equal(boolval, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking alignment of date tab and session content', function(done) {
      roomPage.checkAlignment().then(function(val) {
        assert.equal(val, 0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    // Click on the session Elem to collapse
    it('Expanding the session', function(done) {
      roomPage.toggleSessionElem().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    // Click again to bring it back to default view
    it('Bring back the session to default view', function(done) {
      roomPage.toggleSessionElem().then(function(boolArr) {
        assert.deepEqual(boolArr, [false, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking search functionality', function(done) {
      roomPage.commonSearchTest().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, true, true, true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the working of social buttons', function(done) {
      roomPage.checkSocialLinks().then(function(num) {
        assert.equal(num, 5);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the presence of Add to calendar button', function (done) {
      roomPage.checkAddToCalendarButton().then(function (){
        done();
      }).catch(function(err) {
        done(err);
      })
    });

    it('Checking the working of Add to calendar button', function (done) {
      roomPage.addSessionToCalendar().then(function(promptWindows) {
        assert.equal(promptWindows, 1);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking Jump to Speaker functionality', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.jumpToSpeaker().then(function(val) {
        assert.equal(val, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.checkIsolatedBookmark().then(function(visArr) {
        assert.deepEqual(visArr, [true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the starred mode after search', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.toggleSessionBookmark(['3014', '3015']).then(roomPage.searchThenStarredMode.bind(roomPage)).then(function(boolArr) {
        assert.deepEqual(boolArr, [false, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking search in starred mode', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.starredModeThenSearch().then(function(boolArr) {
        assert.deepEqual(boolArr, [false, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking dynamic link for Rooms and Tracks filter', function (done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.driver.manage().window().maximize();
      roomPage.checkFilterDynamicLink().then(function (visibleRoomTrackArr) {
        assert.deepEqual(visibleRoomTrackArr[0], [true, false, true]);
        assert.deepEqual(visibleRoomTrackArr[1], [true, false, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking direct link for Rooms filter', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/rooms.html#Balboa');
      roomPage.checkRoomFilterDirectLink().then(function(roomsArr) {
        assert.deepEqual(roomsArr, ["1078", "1079", "1080", "1081"]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  describe('Testing Speakers page', function() {
    before(function() {
      speakerPage.init(driver);
      speakerPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/speakers.html');
    });

    it('Checking search functionality', function(done) {
      speakerPage.searchTest().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Display speaker details and test social links on hovering over image', function(done) {
      speakerPage.hoverOverSpeaker().then(function(val) {
        assert.equal(val, 0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Jump to track page on clicking session of a speaker', function(done) {
      speakerPage.jumpToTrack().then(function(val) {
        assert.equal(val, 1);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  describe('Testing Speakers page for single page type', function() {
    before(function() {
      speakerPage.init(driver);
      speakerPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/speakers.html');
    });

    it('Jump to session page on clicking session of a speaker', function(done) {
      speakerPage.jumpToSession().then(function(val) {
        assert.equal(val, 1);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });
});
