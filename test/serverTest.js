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
var By = webdriver.By;




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
  describe('.createDistDir()', function() {
    this.timeout(200000);

    it('should generate the event site', function(done) {
      var data = {};
      data.body = {
        "email": "test@event.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/",
        "datasource": "eventapi",
        "assetmode" : "download"
      };

      generator.createDistDir(data, 'Socket', function(appFolder) {
        assert.equal(appFolder, "test@event.com/FOSSASIA 2016");
        done();
      });

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
      eventPage.visit('http://localhost:5000/live/preview/test@event.com/FOSSASIA%202016');
    });

    it('Checking the title of the page', function(done) {
      eventPage.getEventName().then(function(eventName) {
        assert.equal(eventName, "FOSSASIA 2016");
        done();
      });
    });
  });
});

