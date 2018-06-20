
'use strict';

const assert = require('chai').assert;
let generator = require('../src/backend/generator.js');
let app = require('../src/app');
let webdriver = require('selenium-webdriver');
let sessionPage = require('../src/selenium/sessionPage.js');
let eventPage = require('../src/selenium/eventPage.js');

describe('app', () => {
  describe('run', () => {
    it("should run app", () => {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 5000));
    });
  });

});

describe('generate', function() {
  describe('.create different event sites and copy assets of overview site', function() {
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

  describe('Testing Session page', function() {
    before(function() {
      sessionPage.init(driver);
      sessionPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/sessions/session_1090.html');
    });

    it('Get the title of the session', function(done) {
        sessionPage.getSessionTitle().then(function(val) {
        assert.equal(val, 'IT All Hands (Session of 2 hours) | IT');
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Check the background color of the title', function(done) {
      sessionPage.getSessionBackgroundColor().then(function(val) {
        assert.equal(val, 'rgba(88, 214, 141, 1)');
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Get the speaker of the session', function(done) {
      sessionPage.getSpeakerName().then(function(val) {
        assert.equal(val, 'Alex Fridman');
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Jump to tracks page', function(done) {
      sessionPage.jumpToTrack().then(function(val) {
        assert.equal(val, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Jump to speakers page', function(done) {
      sessionPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/sessions/session_1090.html');
      sessionPage.jumpToSpeaker().then(function(val) {
        assert.equal(val, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Jump to rooms page', function(done) {
      sessionPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/sessions/session_1090.html');
      sessionPage.jumpToRoom().then(function(val) {
        assert.equal(val, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('Testing event page', function() {
    before(function() {
      eventPage.init(driver);
      eventPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017');
    });

    it('Check for Scrollbars', function(done) {
      let sizesArr = [
        [300, 600],
        [720, 600]
      ];
      eventPage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        eventPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the title of the page', function(done) {
      eventPage.getEventName().then(function(eventName) {
        assert.equal(eventName, "FOSSASIA Summit 2017");
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the presence of tweet section', function(done) {
      eventPage.checkTweetSection().then(function() {
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Check whether the down button is working or not', function(done) {
      eventPage.checkDownButton().then(function(offset) {
        assert.equal(offset, 0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the presence of Sponsors section', function(done) {
      eventPage.checkSponsorSection().then(function() {
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking broken links in of Sponsors section', function(done) {
      eventPage.getSponsorsBrokenLinks().then(function(brokenLinksCount) {
        assert.equal(brokenLinksCount, 1);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });
});
