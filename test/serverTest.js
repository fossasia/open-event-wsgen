/**
 * Created by championswimmer on 10/7/16.
 */

/* eslint no-undef: 0 */

'use strict';

var assert = require('chai').assert;
const jsonfile = require('jsonfile');

var fold = require('../src/generator/backend/fold.js');
var generator = require('../src/generator/backend/generator.js');
var dist = require('../src/generator/backend/dist.js');

var data = {
  event: jsonfile.readFileSync(__dirname + '/../mockjson/event'),
  sponsors: jsonfile.readFileSync(__dirname + '/../mockjson/sponsors'),
  sessions: jsonfile.readFileSync(__dirname + '/../mockjson/sessions')
};


describe('fold', function() {
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
  })
  describe('extractEventUrls()' , function () {
    it('should return event and logo urls', function () {
      const linkModeUrls = fold.extractEventUrls(data.event, {assetmode:'link'});
      const downloadModeUrls = fold.extractEventUrls(data.event, {assetmode:'download'});

      assert.equal(linkModeUrls.main_page_url, data.event.event_url);
      assert.equal(linkModeUrls.logo_url, data.event.logo);
      assert.equal(downloadModeUrls.logo_url, 'img/speakers/Logo_OpenTecSummit_TXT_grey.png');
    })
  })
});

