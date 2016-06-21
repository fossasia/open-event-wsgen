var request = require("request");
var port = process.env.PORT || 5000;
var base_url = "http://localhost:"+ port +"/"

describe("Hello World Server", function() {
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  });
});