
'use strict';

const assert = require('chai').assert;
let generator = require('../src/backend/generator.js');
let app = require('../src/app');
const { getDriver } = require('./helper');
let trackPage = require('../src/selenium/trackPage.js');

describe('app', () => {
  describe('run', () => {
    it('should run app', () => {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 3000));
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
        "gcalendar": {
          'id': 'XXXXXXXXX',
          'key': 'XXXXXXXX'
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
        "theme": "dark",
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
    driver = getDriver();
  });

  after(function() {
    return driver.quit();
  });

  describe('Testing tracks page', function() {
    before(function() {
      trackPage.init(driver);
      trackPage.visit('http://localhost:3000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
    });

    it('Test for font color of sessions', function(done) {
      trackPage.getSessionElemsColor().then(function(colorArr) {
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
      trackPage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        trackPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking track name list appear near the top of page', function(done) {
      trackPage.checkTrackNamePos().then(function(boolval) {
        assert.equal(boolval, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking horizontal alignment of date tab and session content below it', function(done) {
      trackPage.checkAlignment().then(function(val) {
        assert.equal(val, 0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking search functionality', function(done) {
      trackPage.commonSearchTest().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, true, true, true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    //Click on the session Elem to collapse
    it('Expanding the session', function(done) {
      trackPage.toggleSessionElem().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    //Click again to bring it back to default view
    it('Bring back the session to default view', function(done) {
      trackPage.toggleSessionElem().then(function(boolArr) {
        assert.deepEqual(boolArr, [false, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking Jump to Speaker functionality', function(done) {
      trackPage.jumpToSpeaker().then(function(val) {
        assert.equal(val, true);
        trackPage.visit('http://localhost:3000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
        done();
      }).catch(function(err) {
        done(err);
      });
    });
    
    // #DISABLE TESTS TEMPORARILY (DHRUV JAIN) - Circleci not working properly
    // it('Checking the working of social buttons', function(done) {
    //   trackPage.checkSocialLinks().then(function(num) {
    //     assert.equal(num, 5);
    //     done();
    //   }).catch(function(err) {
    //     done(err);
    //   });
    // });

    it('Checking the presence of Add to calendar button', function (done) {
      trackPage.checkAddToCalendarButton().then(function (){
        done();
      }).catch(function(err) {
        done(err);
      })
    });

    it('Checking the working of Add to calendar button', function (done) {
      trackPage.addSessionToCalendar().then(function(promptWindows) {
        assert.equal(promptWindows, 2);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function(done) {
      trackPage.visit('http://localhost:3000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
      trackPage.checkIsolatedBookmark().then(function(visArr) {
        assert.deepEqual(visArr, [true, true, false, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the working of video iframe', function (done) {
      trackPage.checkVideo().then(function(bool) {
        assert.equal(bool, false);
        done();
      }).catch(function(err) {
        done(err);
      })
    });

    it('Checking the Track Filter', function(done) {
      trackPage.checkIsolatedTrackFilter().then(function(numTrack) {
        assert.equal(numTrack, 1);
        driver.sleep(1000);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Track filter followed by search and starred filter and reversing them', function(done) {
      trackPage.visit('http://localhost:3000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
      trackPage.filterCombination(['trackselect', 'search', 'starred', 'unstarred', 'unsearch', 'trackunselect']).then(function(val) {
        assert.deepEqual(val[0], [true, true, true, true, false, false]);
        assert.deepEqual(val[1], [true, false, true, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Search filter followed by track and starred filter and reversing them', function(done) {
      trackPage.filterCombination(['search', 'trackselect', 'starred', 'unstarred', 'trackunselect', 'unsearch']).then(function(val) {
        assert.deepEqual(val[0], [true, false, true, false, true, false]);
        assert.deepEqual(val[1], [true, false, true, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Track filter followed by starred and search filter and reversing them', function(done) {
      trackPage.filterCombination(['trackselect', 'starred', 'search', 'unsearch', 'unstarred', 'trackunselect']).then(function(val) {
        assert.deepEqual(val[0], [true, true, true, true, false, false]);
        assert.deepEqual(val[1], [true, true, false, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Search filter followed by starred and track filter and reversing them', function(done) {
      trackPage.filterCombination(['search', 'starred', 'trackselect', 'trackunselect', 'unstarred', 'unsearch']).then(function(val) {
        assert.deepEqual(val[0], [true, false, true, false, true, false]);
        assert.deepEqual(val[1], [true, false, false, false, true, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Starred filter followed by search and track filter and reversing them', function(done) {
      trackPage.filterCombination(['starred', 'search', 'trackselect', 'trackunselect', 'unsearch', 'unstarred']).then(function(val) {
        assert.deepEqual(val[0], [true, true, false, false, true, false]);
        assert.deepEqual(val[1], [true, false, false, false, true, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Starred filter followed by track And search filter and reversing them', function(done) {
      trackPage.filterCombination(['starred', 'trackselect', 'search', 'unsearch', 'trackunselect', 'unstarred']).then(function(val) {
        assert.deepEqual(val[0], [true, true, false, false, true, false]);
        assert.deepEqual(val[1], [true, true, false, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the share link', function(done) {
      trackPage.checkSharableUrl().then(function(link) {
        assert.equal(link, 'http://localhost:3000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html#3014');
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking dynamic link for Rooms and Tracks filter', function (done) {
      trackPage.visit('http://localhost:3000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
      trackPage.driver.manage().window().maximize();
      trackPage.checkFilterDynamicLink().then(function (visibleRoomTrackArr) {
        assert.deepEqual(visibleRoomTrackArr[0], [true, false, true]);
        assert.deepEqual(visibleRoomTrackArr[1], [true, false, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking direct link for tracks filter', function(done) {
      trackPage.visit('http://localhost:3000/live/preview/a@a.com/MozillaAllHands2017/tracks.html#Meals%20w/%20Registered%20Guests');
      trackPage.checkTrackFilterDirectLink().then(function(tracksArr) {
        assert.deepEqual(tracksArr, ["1002", "1101", "1102"]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the background colors for dark theme', function (done) {
      trackPage.visit('http://localhost:3000/live/preview/a@a.com/MozillaAllHands2017/tracks.html');
      trackPage.getBackgroundColor('tracks').then(function(bgcolorArr) {
        assert.deepEqual(bgcolorArr, ['rgba(51, 61, 90, 1)', 'rgba(35, 41, 58, 1)']);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });
});
