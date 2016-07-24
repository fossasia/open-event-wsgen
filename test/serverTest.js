/**
 * Created by championswimmer on 10/7/16.
 */

/* eslint no-undef: 0 */

'use strict';

var assert = require('chai').assert;
const jsonfile = require('jsonfile');

var fold = require('../src/backend/fold.js');
var generator = require('../src/backend/generator.js');
var dist = require('../src/backend/dist.js');
var app = require('../src/app');

var data = {
  event: jsonfile.readFileSync(__dirname + '/../mockjson/event'),
  sponsors: jsonfile.readFileSync(__dirname + '/../mockjson/sponsors'),
  sessions: jsonfile.readFileSync(__dirname + '/../mockjson/sessions'),
  speakers: jsonfile.readFileSync(__dirname + '/../mockjson/speakers'),
  microlocations: jsonfile.readFileSync(__dirname + '/../mockjson/microlocations'),
  tracks: jsonfile.readFileSync(__dirname + '/../mockjson/tracks')

};


describe('fold', function() {
  describe('.foldByTrack()', function () {
    it('should sort sessions by track', function () {
      const reqOptsLink = {
        assetmode: 'link'
      };
      const trackListLink = fold.foldByTrack(data.sessions, data.speakers, data.tracks, reqOptsLink);
      assert.equal(trackListLink[0].title, 'Maker Space');

      const reqOptsDl = {
        assetmode: 'download',
        email: 'a@a.com',
        name: 'testapp'
      };
      const trackListDl = fold.foldByTrack(data.sessions, data.speakers, data.tracks, reqOptsDl);
      assert.equal(trackListDl[0].title, 'Maker Space');
    })
  });
  describe('.foldByDate()', function () {
    it('should sort tracks by date', function () {
      const dateData = fold.foldByDate(data.tracks);
      assert.equal(dateData[0].tracks[0].name, 'Maker Space');
    })
  });
  describe('.createSocialLinks()', function () {
    it('should return array of social links of event', function () {
      var socialLinks = fold.createSocialLinks(data.event);
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
      const linkModeUrls = fold.extractEventUrls(data.event, {assetmode:'link'});
      const downloadModeUrls = fold.extractEventUrls(data.event, {assetmode:'download', email:"a@b.com", name:"testapp"});

      assert.equal(linkModeUrls.main_page_url, data.event.event_url);
      assert.equal(linkModeUrls.logo_url, data.event.logo);
      assert.equal(downloadModeUrls.logo_url, 'img/speakers/Logo_OpenTecSummit_TXT_grey.png');
    })
  });
  describe('getCopyrightData()', function () {
    it('should get copyright data from event', function () {
      const copyright = fold.getCopyrightData(data.event);
      assert.equal(copyright.holder_url, 'http://opentechsummit.net');
    })
  });
  describe('.foldByLevel()', function () {
    it('should sort sponsors by level', function () {
      const levelData = fold.foldByLevel(data.sponsors);
      assert.equal(levelData['1'][0].name, 'FFII');
    })
  });
  describe('.foldByRooms()', function () {
    it('should return sessions grouped by rooms', function () {
      const roomData = fold.foldByRooms(data.microlocations, data.sessions, data.tracks);
      assert.equal(roomData[0].hall, 'Erdgeschoss, Saal / Ground Floor');
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
      assert.equal(fold.getAppName(data.event), 'Open Tech Summit')
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
