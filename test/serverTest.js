/**
 * Created by championswimmer on 10/7/16.
 */

/* eslint no-undef: 0 */

'use strict';

const assert = require('chai').assert;
const async = require('async');
const config = require('../config.json');
const request = require('request').defaults({'proxy': config.proxy});

let fold = require('../src/backend/fold_v2.js');
let generator = require('../src/backend/generator.js');
let dist = require('../src/backend/dist.js');
let app = require('../src/app');
let fs = require('fs');


let data = {
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
      let socialLinks = fold.createSocialLinks(data.event.json);
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'dark',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2016",
        "datasource": "eventapi",
        "assetmode": "download",
        "gcalendar": {
                        'id': process.env.gcalendar_id,
                        'key': process.env.gcalendar_key
                     }
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2016");
        done();
      });

    });

    it('should generate the Open Tech Summit site', function (done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/NextcloudConference2017/",
        "datasource": "eventapi",
        "assetmode": "download",
        "gcalendar": {
                        'id': process.env.gcalendar_id,
                        'key': process.env.gcalendar_key
                     }
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/NextcloudConference2017");
        done();
      });

    });

    it('should generate the GoogleIO 17 event', function (done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'dark',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/RedHatSummit17",
        "theme": 'light',
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/RedHatSummit2017");
        done();
      });
    });

    it('should generate the FOSSASIA Summit 2014 event', function (done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
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
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIASummit2010",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit2010");
        done();
      });

    });

    it('should generate the Mozilla All Hands 2016 event', function (done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/MozillaAllHands16",
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/AllHands/2016Hawaii");
        done();
      });

    });

    it('should generate the FOSSASIA Summit 2018 event', function (done) {
      let data = {};

      data.body = {
        "email": 'a@a.com',
        "theme": 'light',
        "sessionMode": 'expand',
        "apiVersion": 'api_v1',
        "datasource": 'eventapi',
        "apiendpoint": 'https://eventyay.com/api/v1/events/275',
        "assetmode": 'download'
      };


      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/FOSSASIASummit");
        done();
      });

    });

    it('should generate the Spark Summit 2017 event', function (done) {
      let data = {};

      data.body = {
        "email": 'a@a.com',
        "theme": 'light',
        "sessionMode": 'expand',
        "apiVersion": 'api_v2',
        "datasource": 'eventapi',
        "apiendpoint": 'https://raw.githubusercontent.com/fossasia/open-event/master/sample/SparkSummit17',
        "assetmode": 'download'
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/SparkSummit2017");
        done();
      });
    });

    it('should generate the OpenTech Summit 2016 event', function (done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
        "apiendpoint": "https://raw.githubusercontent.com/fossasia/open-event/master/sample/OTS16",
        "apiVersion": 'api_v1',
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/OpenTechSummit2016");
        done();
      });
    });

    it('should generate the Nextcloud Conference 2018 event', function (done) {
      let data = {};

      data.body = {
        "email": "a@a.com",
        "name": "Open Event",
        "theme": 'light',
        "apiendpoint": "https://eventyay.com/api/v1/events/77d26f89",
        "apiVersion": 'api_v1',
        "datasource": "eventapi",
        "assetmode": "download"
      };

      generator.createDistDir(data, 'Socket', function (appFolder) {
        assert.equal(appFolder, "a@a.com/NextcloudConference2018");
        done();
      });
    });

    it('should copy all the static files', function (done) {
      let staticPath = __dirname + '/../src/backend/overviewSite/';
      let totalFiles = 19;
      let counter = 0;

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
      copyStatic('mozilla2016.jpg');
      copyStatic('SparkSummit17.jpg');
      copyStatic('ots16.jpg');
      copyStatic('nextcloud2018.jpg');

    });

  });
});
