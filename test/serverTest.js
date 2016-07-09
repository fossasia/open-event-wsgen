/**
 * Created by championswimmer on 10/7/16.
 */
var assert = require('chai').assert;

var fold = require('../src/generator/backend/fold.js');


describe('fold', function() {
  describe('.slugify()', function() {
    it('should turn sentences to slugs', function() {
      assert.equal(fold.slugify('Hello world'), 'hello-world');
    });
  });
});

