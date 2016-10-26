/**
 * Created by championswimmer on 1/8/16.
 */
"use strict";

const helper = require('sendgrid').mail;
const config = require('../../config.json');
const sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY || config.SENDGRID_API_KEY);

const appUrl = process.env.HEROKU_URL;

function sendMail(toEmail, appName, done) {
  const from_email = new helper.Email("championswimmer@gmail.com");
  const to_email = new helper.Email(toEmail);
  const subject = "Your webapp " + appName + " is Ready";
  const content = new helper.Content("text/html", "Hi ! " + "<br>" +
    " Your webapp has been generated " + "<br>" +
    "You can preview it live on " + appUrl + "live/preview/" + toEmail + "/" + appName + "<br>" +
    "You can download a zip of your website from  " + appUrl + "download/" + toEmail + "/" + appName + "<br>" +
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
    done();
  });

}

module.exports = {
  sendMail
};
