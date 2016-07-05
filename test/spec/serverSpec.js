'use strict';

const request = require("request");
const fold = require(__dirname + '/../../src/generator/backend/fold.js');
const port = process.env.PORT || 5000;
const base_url = "http://localhost:" + port + "/";

describe("Open Event Server", function () {
  describe("GET /", function () {
    it("returns status code 200", function (done) {
      request.get(base_url, function (error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  });
});
describe("Testing Fold.js", function () {
  describe("Testing slugify", () => {
    it("it will test slugify", () => {
      let slugString = "String to slugify";
      expect(fold.slugify(slugString)).toEqual("string-to-slugify")
    })
  });

});
