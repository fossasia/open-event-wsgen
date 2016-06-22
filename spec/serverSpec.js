'use strict'

const request = require("request");
const fold = require(__dirname +'/../src/generator/backend/fold.js');
const port = process.env.PORT || 5000;
const base_url = "http://localhost:"+ port +"/"

describe("Open Event Server", function() {
  describe("GET /", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).toBe(200);
        done();
      });
    });
  }); 
});  
describe("Testing Fold.js",function() {
  	describe("Testing SpeakerWithOrg function",function(){
  		it("it will test speakername", function(){
  			let speaker= {
  				name: "speakername",
  			}
  		expect(fold.speakerNameWithOrg(speaker)).toEqual("speakername");
  		});
   		it("it will test speakername and organisation", function(){
  			let speakerWithOrg= {
  				name:"speakername",
  				organisation:"Organisation",
  			}
  		expect(fold.speakerNameWithOrg(speakerWithOrg)).toEqual("speakername (Organisation)");
  		});
  	});
  
 });
