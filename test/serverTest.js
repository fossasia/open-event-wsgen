/**
 * Created by championswimmer on 10/7/16.
 */

/* eslint no-undef: 0 */

'use strict';

const assert = require('chai').assert;
const jsonfile = require('jsonfile');
const async = require('async');
const config = require('../config.json');
const request = require('request').defaults({'proxy': config.proxy});

var fold = require('../src/backend/fold.js');
var generator = require('../src/backend/generator.js');
var dist = require('../src/backend/dist.js');
var app = require('../src/app');
var webdriver = require('selenium-webdriver');
var generatorPage = require('../src/selenium/generatorPage');
var eventPage = require('../src/selenium/eventPage.js');
var trackPage = require('../src/selenium/trackPage.js');
var schedulePage = require('../src/selenium/schedulePage.js');
var roomPage = require('../src/selenium/roomPage.js');
var speakerPage = require('../src/selenium/speakerPage.js');
var sessionPage = require('../src/selenium/sessionPage.js');
var By = webdriver.By;
var fs = require('fs');


var data = {
  event: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016/event'},
  speakers: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016/speakers'},
  sessions: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016/sessions'},
  sponsors: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016/sponsors'},
  tracks: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016/tracks'},
  microlocations: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016/microlocations'}
};


describe('fold', function () {
  this.timeout(60000);
  before((done) => {
    async.each(data, (dataField, callback) => {
      let url = dataField.endpoint;
      request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          dataField.json = JSON.parse(body);
          callback();
        }
      });
    }, (err) => {
      done();
    });
  });

  describe('.foldByTrack()', () => {
    it('should sort sessions by track', () => {
      const reqOptsLink = {
        assetmode: 'link'
      };
      fold.foldByTrack(data.sessions.json, data.speakers.json, data.tracks.json, reqOptsLink, (trackListLink) => {
        assert.equal(trackListLink[0].title, 'OpenTech and IoT');
      });

      const reqOptsDl = {
        assetmode: 'download',
        email: 'a@a.com',
        name: 'testapp'
      };
      fold.foldByTrack(data.sessions.json, data.speakers.json, data.tracks.json, reqOptsDl, (trackListDl) => {
        assert.equal(trackListDl[0].title, 'OpenTech and IoT');
      });
    });
  });
  describe('.foldByDate()', () => {
    it('should sort tracks by date', () => {
      const dateData = fold.foldByDate(data.tracks.json);
      assert.equal(dateData[0].tracks[0].name, 'Big Data/Open Data');
    });
  });
  describe('.createSocialLinks()', () => {
    it('should return array of social links of event', () => {
      var socialLinks = fold.createSocialLinks(data.event.json);
      assert.equal(socialLinks[0].icon, 'twitter');
      assert.equal(socialLinks[1].icon, 'github');
      assert.equal(socialLinks[2].icon, 'facebook');
      assert.equal(socialLinks[3].icon, 'flickr');
      assert.equal(socialLinks[4].icon, 'google-plus');
      assert.equal(socialLinks[5].icon, 'youtube-play');
    });
  });
  describe('extractEventUrls()', () => {
    it('should return event and logo urls', () => {
      fold.extractEventUrls(data.event.json, data.speakers.json, data.sponsors.json, {assetmode: 'link'}, data.speakers.json, (linkModeUrls) => {
        assert.equal(linkModeUrls.main_page_url, data.event.json.event_url);
        assert.equal(linkModeUrls.logo_url, data.event.json.logo);
      });

      fold.extractEventUrls(data.event.json, data.speakers.json, data.sponsors.json, {
        assetmode: 'download',
        email: "a@b.com",
        name: "testapp"
      }, (downloadModeUrls) => {
        assert.equal(downloadModeUrls.logo_url, 'images/fossasia-dark.png');
      });
    });
  });
  describe('getCopyrightData()', () => {
    it('should get copyright data from event', () => {
      const copyright = fold.getCopyrightData(data.event.json);
      assert.equal(copyright['holder-url'], 'http://fossasia.org/contact/');
    });
  });
  describe('.foldByLevel()', () => {
    it('should sort sponsors by level', () => {
      const reqOpts = {
        email: 'a@a.com',
        name: 'testapp'
      };
      fold.foldByLevel(data.sponsors.json, reqOpts, (levelData) => {
        assert.equal(levelData['1'][0].name, 'hackerspace.sg');
      });
    });
  });
  describe('.foldByRooms()', () => {
    it('should return sessions grouped by rooms', () => {
      const roomData = fold.foldByRooms(data.microlocations.json, data.sessions.json, data.speakers.json, data.tracks.json);
      assert.equal(roomData[0].sortKey, '16-03-18');
    });
  });
  describe('.slugify()', () => {
    it('should turn sentences to slugs', () => {
      assert.equal(fold.slugify('Hello world'), 'hello-world');
      assert.equal(fold.slugify(), '');
    });
  });
  describe('.getAppName()', () => {
    it('should return event title from event object', () => {
      assert.equal(fold.getAppName(data.event.json), 'FOSSASIA Summit 2016');
    });
  });
  describe('.checkNullHtml()', () => {

    it('should return true when the html passed doesn\'t contain info', () => {
      assert.equal(fold.checkNullHtml('<p></p>'), true);
    });

    it('should return true when the argument passed is undefined', () => {
      assert.equal(fold.checkNullHtml(), true);
    });

    it('should return false when the html contains info', () => {
      assert.equal(fold.checkNullHtml('<p> I like writing tests </p>'), false);
    });

  })
});

describe('app', () => {
  describe('run', () => {
    it('should run app', () => {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 5000));
    });
  });
});

describe('generate', function () {
  describe('.create different event sites and copy assets of overview site', function () {
    this.timeout(800000);

    it('should generate the Facebook Developer Conference Hands', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FBF817/",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/F8-FacebookDeveloperConference2017");
        done();
      });

    });

    it('should generate the FOSSASIA Summit 2017', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
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
      var data = {};

      data.body = {
        "email": "a@a.com",
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

    it('should generate the OSCON 2017', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/OSCON17",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/OSCON2017");
        done();
      });

    });

    it('should generate the FOSSASIA Summit 2016 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2016");
        done();
      });

    });

    it('should generate the Open Tech Summit site', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/OpenTechSummit2017/",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/OpenTechSummit");
        done();
      });

    });

    it('should generate the Open Tech Summit site', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/NextcloudConference2017/",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/NextcloudConference2017");
        done();
      });

    });

    it('should generate the GoogleIO 17 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/GoogleIO17",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/GoogleIO2017");
        done();
      });

    });

    it('should generate the Droidcon 17 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/Droidcon17",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/Droidcon2017");
        done();
      });

    });

    it('should generate the PyCon 17 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/PyCon17",
        "datasource": "eventapi",
        "assetmode": "download",
        "sessionMode": "single"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/PyCon2017");
        done();
      });

    });

    it('should generate the RedHat Summit 2017 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/RedHatSummit17",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/RedHatSummit2017");
        done();
      });
    });

    it('should generate the FOSSASIA Summit 2014 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2014",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2014");
        done();
      });
    });

    it('should generate the FOSSASIA Summit 2011 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2011",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2011");
        done();
      });

    });

    it('should generate the FOSSASIA Summit 2010 event', function (done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2010",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2010");
        done();
      });

    });

    it('should copy all the static files', function (done) {
      var staticPath = __dirname + '/../src/backend/overviewSite/';
      var totalFiles = 15;
      var counter = 0;

      function copyStatic(fileName) {
        fs.readFile(staticPath + fileName, function (err, data) {
          if (err) {
            done(err);
            return;
          }
          fs.writeFile(dist.distPath + '/a@a.com/' + fileName, data, function (err) {
            if (err) {
              done(err);
              return;
            }
            counter++;
            if (counter === totalFiles) {
              done();
            }
          });
        });
      }

      copyStatic('index.html');
      copyStatic('fasmall.jpg');
      copyStatic('otssmall.jpg');
      copyStatic('fbsmall.jpg');
      copyStatic('mozilla_banner.jpg');
      copyStatic('oscon.png');
      copyStatic('fa16small.jpg');
      copyStatic('nextcloud2017.jpg');
      copyStatic('googleIO.jpg');
      copyStatic('PyCon17.jpg');
      copyStatic('redhat.jpg');
      copyStatic('droidcon.jpg');
      copyStatic('fossasia16.jpg');
      copyStatic('fossasia2011.jpg');
      copyStatic('fossasia2010.JPG');

    });

  });
});

describe("Running Selenium tests on Chrome Driver", function () {
  this.timeout(600000);
  var driver;
  before(function () {
    if (process.env.SAUCE_USERNAME !== undefined) {
      driver = new webdriver.Builder()
        .usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
        .withCapabilities({
          'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
          build: process.env.TRAVIS_BUILD_NUMBER,
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          browserName: "chrome"
        }).build();
    } else {
      driver = new webdriver.Builder()
        .withCapabilities({
          browserName: "chrome"
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

  describe('Testing event page', function () {

    before(function () {
      eventPage.init(driver);
      eventPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017');
    });

    it('Check for Scrollbars', function (done) {
      var sizesArr = [[300, 600], [720, 600]];
      eventPage.getScrollbarVisibility(sizesArr).then(function (statusArr) {
        eventPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the broken links in navbar and footer', function (done) {
      eventPage.getNavbarFooterBrokenLinks().then(function (numBrokenLinks) {
        assert.equal(numBrokenLinks, 0);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the title of the page', function (done) {
      eventPage.getEventName().then(function (eventName) {
        assert.equal(eventName, "FOSSASIA Summit 2017");
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the presence of tweet section', function (done) {
      eventPage.checkTweetSection().then(function () {
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Check whether the down button is working or not', function (done) {
      eventPage.checkDownButton().then(function (offset) {
        assert.equal(offset, 0);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });

  describe('Testing tracks page', function () {

    before(function () {
      trackPage.init(driver);
      trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
    });

    it('Test for font color of sessions', function (done) {
      trackPage.getSessionElemsColor().then(function (colorArr) {
        assert.deepEqual(colorArr, ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)']);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Check for Scrollbars', function (done) {
      var sizesArr = [[300, 600], [720, 600]];
      trackPage.getScrollbarVisibility(sizesArr).then(function (statusArr) {
        trackPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });


    it('Checking track name list appear near the top of page', function (done) {
      trackPage.checkTrackNamePos().then(function (boolval) {
        assert.equal(boolval, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking horizontal alignment of date tab and session content below it', function (done) {
      trackPage.checkAlignment().then(function (val) {
        assert.equal(val, 0);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking search functionality', function (done) {
      trackPage.commonSearchTest().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, true, true, true, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    //Click on the session Elem to collapse
    it('Expanding the session', function (done) {
      trackPage.toggleSessionElem().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    //Click again to bring it back to default view
    it('Bring back the session to default view', function (done) {
      trackPage.toggleSessionElem().then(function (boolArr) {
        assert.deepEqual(boolArr, [false, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking Jump to Speaker functionality', function (done) {
      trackPage.jumpToSpeaker().then(function (val) {
        assert.equal(val, true);
        trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the working of social buttons', function (done) {
      trackPage.checkSocialLinks().then(function (num) {
        assert.equal(num, 5);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function (done) {
      trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
      trackPage.checkIsolatedBookmark().then(function (visArr) {
        assert.deepEqual(visArr, [true, true, false, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the Track Filter', function (done) {
      trackPage.checkIsolatedTrackFilter().then(function (numTrack) {
        assert.equal(numTrack, 1);
        driver.sleep(1000);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Track filter followed by search and starred filter and reversing them', function (done) {
      trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/tracks.html');
      trackPage.filterCombination(['trackselect', 'search', 'starred', 'unstarred', 'unsearch', 'trackunselect']).then(function (val) {
        assert.deepEqual(val[0], [true, true, true, true, false, false]);
        assert.deepEqual(val[1], [true, false, true, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Search filter followed by track and starred filter and reversing them', function (done) {
      trackPage.filterCombination(['search', 'trackselect', 'starred', 'unstarred', 'trackunselect', 'unsearch']).then(function (val) {
        assert.deepEqual(val[0], [true, false, true, false, true, false]);
        assert.deepEqual(val[1], [true, false, true, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Track filter followed by starred and search filter and reversing them', function (done) {
      trackPage.filterCombination(['trackselect', 'starred', 'search', 'unsearch', 'unstarred', 'trackunselect']).then(function (val) {
        assert.deepEqual(val[0], [true, true, true, true, false, false]);
        assert.deepEqual(val[1], [true, true, false, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Search filter followed by starred and track filter and reversing them', function (done) {
      trackPage.filterCombination(['search', 'starred', 'trackselect', 'trackunselect', 'unstarred', 'unsearch']).then(function (val) {
        assert.deepEqual(val[0], [true, false, true, false, true, false]);
        assert.deepEqual(val[1], [true, false, false, false, true, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Starred filter followed by search and track filter and reversing them', function (done) {
      trackPage.filterCombination(['starred', 'search', 'trackselect', 'trackunselect', 'unsearch', 'unstarred']).then(function (val) {
        assert.deepEqual(val[0], [true, true, false, false, true, false]);
        assert.deepEqual(val[1], [true, false, false, false, true, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Starred filter followed by track And search filter and reversing them', function (done) {
      trackPage.filterCombination(['starred', 'trackselect', 'search', 'unsearch', 'trackunselect', 'unstarred']).then(function (val) {
        assert.deepEqual(val[0], [true, true, false, false, true, false]);
        assert.deepEqual(val[1], [true, true, false, false, false, false]);
        assert.deepEqual(val[2], [true, false, false, false, false, false]);
        assert.deepEqual(val[3], val[1]);
        assert.deepEqual(val[4], val[0]);
        assert.deepEqual(val[5], [true, true, true, true, true, true]);
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

    it('Test for font color of sessions', function (done) {
      schedulePage.getSessionElemsColor().then(function (colorArr) {
        assert.deepEqual(colorArr, ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)']);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Check for Scrollbars', function (done) {
      var sizesArr = [[300, 600], [720, 600]];
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
    //First array gives the visibility of the date divs inside the list view container
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
        assert.deepEqual(visArr, [true, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });

  describe('Testing rooms page', function () {

    before(function () {
      roomPage.init(driver);
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
    });

    it('Test for font color of sessions', function (done) {
      roomPage.getSessionElemsColor().then(function (colorArr) {
        assert.deepEqual(colorArr, ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)']);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Check for Scrollbars', function (done) {
      var sizesArr = [[300, 600], [720, 600]];
      roomPage.getScrollbarVisibility(sizesArr).then(function (statusArr) {
        roomPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking track name list appear near the top of page', function (done) {
      trackPage.checkTrackNamePos().then(function (boolval) {
        assert.equal(boolval, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking alignment of date tab and session content', function (done) {
      trackPage.checkAlignment().then(function (val) {
        assert.equal(val, 0);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    // Click on the session Elem to collapse
    it('Expanding the session', function (done) {
      roomPage.toggleSessionElem().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    // Click again to bring it back to default view
    it('Bring back the session to default view', function (done) {
      roomPage.toggleSessionElem().then(function (boolArr) {
        assert.deepEqual(boolArr, [false, true]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking search functionality', function (done) {
      roomPage.commonSearchTest().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, true, true, true, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the working of social buttons', function (done) {
      roomPage.checkSocialLinks().then(function (num) {
        assert.equal(num, 5);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking Jump to Speaker functionality', function (done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.jumpToSpeaker().then(function (val) {
        assert.equal(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function (done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.checkIsolatedBookmark().then(function (visArr) {
        assert.deepEqual(visArr, [false, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking the starred mode after search', function (done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.toggleSessionBookmark(['3014', '3015']).then(roomPage.searchThenStarredMode.bind(roomPage)).then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Checking search in starred mode', function (done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/rooms.html');
      roomPage.starredModeThenSearch().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });

  describe('Testing Speakers page', function () {

    before(function () {
      speakerPage.init(driver);
      speakerPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit2017/speakers.html');
    });

    it('Checking search functionality', function (done) {
      speakerPage.searchTest().then(function (boolArr) {
        assert.deepEqual(boolArr, [true, false]);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Jump to track page on clicking session of a speaker', function (done) {
      speakerPage.jumpToTrack().then(function (val) {
        assert.equal(val, 1);
        done();
      }).catch(function (err) {
        done(err);
      });
    });
  });

  describe('Testing Speakers page for single page type', function () {

    before(function () {
      speakerPage.init(driver);
      speakerPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/speakers.html');
    });

    it('Jump to session page on clicking session of a speaker', function (done) {
      speakerPage.jumpToSession().then(function (val) {
        assert.equal(val, 1);
        done();
      }).catch(function (err) {
        done(err);
      });
    });
  });
  
  describe('Testing Session page', function () {
    before(function () {
      sessionPage.init(driver);
      sessionPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/sessions/session_1090.html');
    });
    
    it('Get the title of the session', function (done) {
      sessionPage.getSessionTitle().then(function (val) {
        assert.equal(val, 'IT All Hands (Session of 2 hours) | IT');
        done();
      }).catch(function (err) {
        done(err);
      });
    });
    
    it('Check the background color of the title', function (done) {
      sessionPage.getSessionBackgroundColor().then(function (val) {
        assert.equal(val, 'rgba(88, 214, 141, 1)');
        done();
      }).catch(function (err) {
        done(err);
      });
    });
    
    it('Get the speaker of the session', function (done) {
      sessionPage.getSpeakerName().then(function (val) {
        assert.equal(val, 'Alex Fridman');
        done();
      }).catch(function (err) {
        done(err);
      });
    });
    
    it('Jump to tracks page', function (done) {
      sessionPage.jumpToTrack().then(function (val) {
        assert.equal(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });
    
    it('Jump to speakers page', function (done) {
      sessionPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/sessions/session_1090.html');
      sessionPage.jumpToSpeaker().then(function (val) {
        assert.equal(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });
    
    it('Jump to rooms page', function (done) {
      sessionPage.visit('http://localhost:5000/live/preview/a@a.com/MozillaAllHands2017/sessions/session_1090.html');
      sessionPage.jumpToRoom().then(function (val) {
        assert.equal(val, true);
        done();
      }).catch(function (err) {
        done(err);
      });
    });
    
  });
  
});
