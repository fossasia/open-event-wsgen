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
var eventPage = require('../src/selenium/eventPage.js');
var trackPage = require('../src/selenium/trackPage.js');
var schedulePage = require('../src/selenium/schedulePage.js');
var roomPage = require('../src/selenium/roomPage.js');
var speakerPage = require('../src/selenium/speakerPage.js');
var By = webdriver.By;
var fs = require('fs');



var data = {
  event: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/event'},
  speakers: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/speakers'},
  sessions: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/sessions'},
  sponsors: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/sponsors'},
  tracks: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/tracks'},
  microlocations: {endpoint: 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/microlocations'}
};


describe('fold', function() {
  this.timeout(60000);
  before( (done) => {
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

  describe('.foldByTrack()',  () => {
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
  describe('extractEventUrls()' , () => {
    it('should return event and logo urls', () => {
      fold.extractEventUrls(data.event.json, data.speakers.json, data.sponsors.json, {assetmode:'link'},data.speakers.json, (linkModeUrls) => {
        assert.equal(linkModeUrls.main_page_url, data.event.json.event_url);
        assert.equal(linkModeUrls.logo_url, data.event.json.logo);
      });

      fold.extractEventUrls(data.event.json, data.speakers.json, data.sponsors.json, {assetmode:'download', email:"a@b.com", name:"testapp"}, (downloadModeUrls) => {
        assert.equal(downloadModeUrls.logo_url, 'images/fossasia-dark.png');
      });
    });
  });
  describe('getCopyrightData()', () => {
    it('should get copyright data from event', () => {
      const copyright = fold.getCopyrightData(data.event.json);
      assert.equal(copyright.holder_url, 'http://fossasia.org/contact/');
    });
  });
  describe('.foldByLevel()', () => {
    it('should sort sponsors by level', () => {
      const reqOpts = {
        email: 'a@a.com',
        name: 'testapp'
      };
      fold.foldByLevel(data.sponsors.json,reqOpts, (levelData) => {
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
      assert.equal(fold.getAppName(data.event.json), 'FOSSASIA 2016');
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

describe('app',  () =>  {
  describe('run', () => {
    it('should run app', () =>  {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 5000));
    });
  });
});

describe('generate', function() {
  describe('.create different event sites and copy assets of overview site', function() {
    this.timeout(800000);

    it('should generate the Open Tech Summit site', function(done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://eventyay.com/api/v1/events/69",
        "datasource": "eventapi",
        "assetmode" : "download"
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/OpenTechSummit");
        done();
      });

    });

    it('should generate the Facebook Developer Conference Hands', function(done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FBF817",
        "datasource": "eventapi",
        "assetmode" : "download"
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/F8-FacebookDeveloperConference2017");
        done();
      });

    });

    it('should generate the FOSSASIA Summit 2017', function(done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "http://eventyay.com/api/v1/events/6",
        "datasource": "eventapi",
        "assetmode" : "download",
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit");
        done();
      });

    });

    it('should generate the Mozilla All Hands 2017', function(done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/MozillaAllHands17",
        "sessionMode": "single",
        "datasource": "eventapi",
        "assetmode" : "download"
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/MozillaAllHands2017");
        done();
      });

    });

    it('should generate the OSCON 2017', function(done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/OSCON17",
        "datasource": "eventapi",
        "assetmode" : "download"
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/OSCONopensourceconvention");
        done();
      });

    });

    it('should generate the FOSSASIA 16 event', function(done) {
      var data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16",
        "datasource": "eventapi",
        "assetmode" : "download"
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIA2016");
        done();
      });

    });

    it('should copy all the static files', function(done) {
      var staticPath = __dirname + '/../src/backend/overviewSite/';
      var totalFiles = 7;
      var counter = 0;

      function copyStatic(fileName) {
        fs.readFile(staticPath + fileName, function(err, data) {
          if (err) {
            done(err);
            return;
          }
          fs.writeFile(dist.distPath + '/a@a.com/' + fileName, data, function(err) {
            if (err) {
              done(err);
              return;
            }
            counter++;
            if (counter === totalFiles) { done(); }
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

    });

  });
});

describe("Running Selenium tests on Chrome Driver", function() {
  this.timeout(600000);
  var driver;
  before(function() {
    if (process.env.SAUCE_USERNAME !== undefined) {
      driver = new webdriver.Builder()
        .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
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

  after(function() {
    return driver.quit();
  });

  describe('Testing event page', function() {

    before(function() {
      eventPage.init(driver);
      eventPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit');
    });

    it('Check for Scrollbars', function(done) {
      var sizesArr = [[300, 600], [720, 600]];
      eventPage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        eventPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    })

    it('Checking the broken links in navbar and footer', function(done) {
      eventPage.getNavbarFooterBrokenLinks().then(function(numBrokenLinks) {
        assert.equal(numBrokenLinks, 0);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the title of the page', function(done) {
      eventPage.getEventName().then(function(eventName) {
        assert.equal(eventName, "FOSSASIA Summit");
        done();
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

  });

  describe('Testing tracks page', function() {

    before(function() {
      trackPage.init(driver);
      trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/tracks.html');
    });

    it('Check for Scrollbars', function(done) {
      var sizesArr = [[300, 600], [720, 600]];
      trackPage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        trackPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking subnavbar functionality', function(done) {
      trackPage.checkAllSubnav().then(function(boolArr) {
        trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/tracks.html');
        assert.deepEqual(boolArr, [true, true, true]);
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
        trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/tracks.html');
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function(done) {
      trackPage.checkIsolatedBookmark().then(function(num) {
        assert.equal(num, 2);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the starred mode after search', function(done) {
      trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/tracks.html');
      trackPage.searchThenStarredMode().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking search in starred mode', function(done) {
      trackPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/tracks.html');
      trackPage.starredModeThenSearch().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  describe('Testing schedule page', function() {

    before(function() {
      schedulePage.init(driver);
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/schedule.html');
    });

    it('Check for Scrollbars', function(done) {
      var sizesArr = [[300, 600], [720, 600]];
      schedulePage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        schedulePage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking search functionality', function(done) {
      schedulePage.commonSearchTest().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, true, true, true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    // Click on the session Elem to collapse
    it('Expanding the session', function(done) {
      schedulePage.toggleSessionElem().then(function(val) {
        assert.equal(val, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    // Click again to bring it back to default view
    it('Bring back the session to default view', function(done) {
      schedulePage.toggleSessionElem().then(function(val) {
        assert.deepEqual(val, false);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    //Now, we will do a series of tests to check the behaviour of the date divs when the date and mode is changed
    //First array gives the visibility of the date divs inside the list view container
    //Second array gives the visibility of the date divs inside the calendar view container

    //In default view, all the dates inside the list view must be visible. The calendar view container should not be shown
    it('Checking the default view of the page', function(done) {
      schedulePage.getCurrentView().then(function(arr) {
        assert.deepEqual(arr[0], [true, true, true]);
        assert.deepEqual(arr[1], [false, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Changing the date to Sunday', function(done) {
      schedulePage.changeDay(3).then(function(arr) {
        assert.deepEqual(arr[0], [false, false, true]);
        assert.deepEqual(arr[1], [false, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Changing the mode to Calendar', function(done) {
      schedulePage.changeMode('calendar').then(function(arr) {
        assert.deepEqual(arr[0], [false, false, false]);
        assert.deepEqual(arr[1], [false, false, true]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Changing the date to Saturday in calendar mode itself', function(done) {
      schedulePage.changeDay(2).then(function(arr) {
        assert.deepEqual(arr[0], [false, false, false]);
        assert.deepEqual(arr[1], [false, true, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Changing the mode back to list', function(done) {
      schedulePage.changeMode('list').then(function(arr) {
        assert.deepEqual(arr[0], [false, true, false]);
        assert.deepEqual(arr[1], [false, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking Jump to Speaker functionality', function(done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/schedule.html');
      schedulePage.jumpToSpeaker().then(function(val) {
        assert.equal(val, true);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function(done) {
      schedulePage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/schedule.html');
      schedulePage.checkIsolatedBookmark().then(function(val) {
        assert.equal(val, 1);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  describe('Testing rooms page', function() {

    before(function() {
      roomPage.init(driver);
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/rooms.html');
    });

    it('Check for Scrollbars', function(done) {
      var sizesArr = [[300, 600], [720, 600]];
      roomPage.getScrollbarVisibility(sizesArr).then(function(statusArr) {
        roomPage.driver.manage().window().maximize();
        assert.deepEqual(statusArr, [false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking subnavbar functionality', function(done) {
      roomPage.checkAllSubnav().then(function(boolArr) {
        roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/rooms.html');
        assert.deepEqual(boolArr, [true, true, true]);
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

    it('Checking Jump to Speaker functionality', function(done) {
      roomPage.jumpToSpeaker().then(function(val) {
        assert.equal(val, true);
        roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/rooms.html');
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the bookmark toggle', function(done) {
      roomPage.checkIsolatedBookmark().then(function(val) {
        assert.equal(val, 1);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking the starred mode after search', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/rooms.html');
      roomPage.toggleSessionBookmark(['3014', '3015']).then(roomPage.searchThenStarredMode.bind(roomPage)).then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    it('Checking search in starred mode', function(done) {
      roomPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/rooms.html');
      roomPage.starredModeThenSearch().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false, false]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  describe('Testing Speakers page', function() {

    before(function() {
      speakerPage.init(driver);
      speakerPage.visit('http://localhost:5000/live/preview/a@a.com/FOSSASIASummit/speakers.html');
    });

    it('Checking search functionality', function(done) {
      speakerPage.searchTest().then(function(boolArr) {
        assert.deepEqual(boolArr, [true, false]);
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
});
