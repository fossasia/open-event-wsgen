/**
 * Created by championswimmer on 1/8/16.
 */
"use strict";

const helper = require('sendgrid').mail;
const config = require('../../config.json');
const sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY || config.SENDGRID_API_KEY);
const distHelper = require('./dist.js');
const logger = require('./buildlogger.js');
const aws = require('aws-sdk');
const fs = require('fs');
const generator = require('./generator.js');
const s3 = new aws.S3();
const uuid = require('node-uuid');
const appUrl = process.env.HEROKU_URL;

process.env.AWS_ACCESS_KEY_ID = (process.env.AWS_ACCESS_KEY_ID || config.AWS_ACCESS_KEY_ID);
process.env.AWS_SECRET_ACCESS_KEY = (process.env.AWS_SECRET_ACCESS_KEY || config.AWS_SECRET_ACCESS_KEY);

function uploadAndsendMail(toEmail, appName, socket, done) {
  var file = distHelper.distPath + '/' + toEmail + '/event.zip';
  var fileName = uuid.v4() + appName + '.zip';
  var uploadParams = {Bucket: 'FOSSASIA',  Key: fileName , Body: ''};
  var fileStream = fs.createReadStream(file);
  fileStream.on('error', function(err) {
    console.log("File Error");
    logger.addLog('Error', "Error during upload to S3", socket, err);
  });
  uploadParams.Body = fileStream;
  s3.upload(uploadParams, function (err, data) {
    if(err) {
      console.log("Error", err);
      logger.addLog('Error', 'Error while uploading the zip', socket, err);
    }
    if(data) {
      logger.addLog('Success', 'Upload successful to s3', socket); 
      console.log("Upload Success", data.Location);
      const from_email = new helper.Email("championswimmer@gmail.com");
      const to_email = new helper.Email(toEmail);
      const subject = "Your webapp " + appName + " is Ready";
      const content = new helper.Content("text/html", "Hi ! " + "<br>" +
        " Your webapp has been generated " + "<br>" +
        "You can preview it live on " + appUrl + "live/preview/" + toEmail + "/" + appName + "<br>" +
        "You can download a zip of your website from  " + data.Location + 
        "<br><br><br>" +
        "Thank you for using Open Event Webapp Generator :) ");
      const mail = new helper.Mail(from_email, subject, to_email, content);
      var requestBody = mail.toJSON();
      var request = sg.emptyRequest();
      request.host = 'api.sendgrid.com';
      request.method = 'POST';
      request.path = '/v3/mail/send';
      request.body = requestBody;
      console.log(request);
      sg.API(request, function (response) {
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
        done(data.Location);
      });
    }
  });
}

module.exports = {
  uploadAndsendMail
};
