/**
 * Created by championswimmer on 10/7/16.
 */

/*eslint no-undef: 0*/

var assert = require('chai').assert;
const jsonfile = require('jsonfile');

var fold = require('../src/generator/backend/fold.js');
var generator = require('../src/generator/backend/generator.js');
var dist = require('../src/generator/backend/dist.js');

var data = {
  event: jsonfile.readFileSync(__dirname + '/../mockjson/event')
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
  })
});

