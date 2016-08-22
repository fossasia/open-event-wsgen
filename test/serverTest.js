/**
 * Created by championswimmer on 10/7/16.
 */

/* eslint no-undef: 0 */

'use strict';

const assert = require('chai').assert;
const jsonfile = require('jsonfile');
const async = require('async');
const request = require('request');

var fold = require('../src/backend/fold.js');
var generator = require('../src/backend/generator.js');
var dist = require('../src/backend/dist.js');
var app = require('../src/app');



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
  before(function (done) {
    async.each(data, (dataField, callback) => {
      let url = dataField.endpoint;
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          dataField.json = JSON.parse(body);
          callback();
        }
      })
    }, (err) => {
      done();
    });
  });
  describe('.foldByTrack()', function () {
    it('should sort sessions by track', function () {
      const reqOptsLink = {
        assetmode: 'link'
      };
      const trackListLink = fold.foldByTrack(data.sessions.json, data.speakers.json, data.tracks.json, reqOptsLink);
      assert.equal(trackListLink[0].title, 'OpenTech and IoT');

      const reqOptsDl = {
        assetmode: 'download',
        email: 'a@a.com',
        name: 'testapp'
      };
      const trackListDl = fold.foldByTrack(data.sessions.json, data.speakers.json, data.tracks.json, reqOptsDl);
      assert.equal(trackListDl[0].title, 'OpenTech and IoT');
    })
  });
  describe('.foldByDate()', function () {
    it('should sort tracks by date', function () {
      const dateData = fold.foldByDate(data.tracks.json);
      assert.equal(dateData[0].tracks[0].name, 'Big Data/Open Data');
    })
  });
  describe('.createSocialLinks()', function () {
    it('should return array of social links of event', function () {
      var socialLinks = fold.createSocialLinks(data.event.json);
      assert.equal(socialLinks[0].icon, 'twitter');
      assert.equal(socialLinks[1].icon, 'github');
      assert.equal(socialLinks[2].icon, 'facebook');
      assert.equal(socialLinks[3].icon, 'flickr');
      assert.equal(socialLinks[4].icon, 'google-plus');
      assert.equal(socialLinks[5].icon, 'youtube-play');
    })
  });
  describe('extractEventUrls()' , function () {
    it('should return event and logo urls', function () {
      const linkModeUrls = fold.extractEventUrls(data.event.json, data.speakers.json, {assetmode:'link'},data.speakers.json);
      const downloadModeUrls = fold.extractEventUrls(data.event.json, data.speakers.json, {assetmode:'download', email:"a@b.com", name:"testapp"});

      assert.equal(linkModeUrls.main_page_url, data.event.json.event_url);
      assert.equal(linkModeUrls.logo_url, data.event.json.logo);
      assert.equal(downloadModeUrls.logo_url, 'images/fossasia-dark.png');
    })
  });
  describe('getCopyrightData()', function () {
    it('should get copyright data from event', function () {
      const copyright = fold.getCopyrightData(data.event.json);
      assert.equal(copyright.holder_url, 'http://fossasia.org/contact/');
    })
  });
  describe('.foldByLevel()', function () {
    it('should sort sponsors by level', function () {
      const reqOpts = {
        email: 'a@a.com',
        name: 'testapp'
      };
      const levelData = fold.foldByLevel(data.sponsors.json,reqOpts);
      assert.equal(levelData['1'][0].name, 'Google');
    })
  });
  describe('.foldByRooms()', function () {
    it('should return sessions grouped by rooms', function () {
      const roomData = fold.foldByRooms(data.microlocations.json, data.sessions.json, data.tracks.json);
      //sassert.equal(roomData[0].hall, 'Dalton Hall');
    })
  });
  describe('.slugify()', function() {
    it('should turn sentences to slugs', function() {
      assert.equal(fold.slugify('Hello world'), 'hello-world');
      assert.equal(fold.slugify(), '');
    });
  });
  describe('.getAppName()', function () {
    it('should return event title from event object', function () {
      assert.equal(fold.getAppName(data.event.json), 'FOSSASIA 2016')
    })
  });
});

describe('app', function () {
  describe('run', function () {
    it('should run app', function () {
      const expressApp = app.getApp();
      assert.equal(expressApp.get('port'), (process.env.PORT || 5000))
    })
  })
});

