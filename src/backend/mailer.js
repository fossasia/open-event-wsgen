/**
 * Created by championswimmer on 1/8/16.
 * Modified by uttpal.
 */
'use strict';
const config = require('../../config.json');

/**
 * Set these before requiring aws-sdk for all ENV vars to be loaded properly
 */
process.env.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || config.AWS_ACCESS_KEY_ID;
process.env.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || config.AWS_SECRET_ACCESS_KEY;
process.env.AWS_BUCKET = process.env.AWS_BUCKET || config.AWS_BUCKET;
process.env.CLOUD_STORAGE = process.env.CLOUD_STORAGE || config.CLOUD_STORAGE;

const promise = require('bluebird');
const helper = require('sendgrid').mail;
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY || config.SENDGRID_API_KEY);
const distHelper = require('./dist.js');
const logger = require('./buildlogger.js');
const aws = require('aws-sdk');
const fs = require('fs');
const uuid = require('node-uuid');
const appUrl = process.env.HEROKU_URL;
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const moment = require('moment');

aws.config.setPromisesDependency(promise);

let s3 = new aws.S3();

/**
 * Support Google Cloud Store too using the same AWS SDK via Google Cloud Storage interoperability keys
 */
if (process.env.CLOUD_STORAGE === 'google_cloud') {
  s3 = new aws.S3({endpoint: new aws.Endpoint('https://storage.googleapis.com')});
}

process.env.DEFAULT_MAIL_STRATEGY = process.env.DEFAULT_MAIL_STRATEGY || config.DEFAULT_MAIL_STRATEGY;
process.env.DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || config.DEFAULT_FROM_EMAIL;

function uploadToS3(file, fileName, socket) {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName
  };
  const fileStream = fs.createReadStream(file);

  fileStream.on('error', function(err) {
    console.log('File Error');
    logger.addLog('Error', 'Error during upload to S3', socket, err);
  });
  uploadParams.Body = fileStream;
  return s3.upload(uploadParams).promise();
}

function emailSend(toEmail, url, appName) {
  const subject = 'Your webapp ' + appName + ' is Ready';
  let downloadUrl = url;
  const previewUrl = appUrl + 'live/preview/' + toEmail + '/' + encodeURIComponent(appName);
  const currDate = new Date();
  let previewExpiryDate = new Date();
  let downloadLinkExpiryDate = new Date();
  let mailSendStatus = 0; // boolean to indicate the success and failure of email send
  let chanChannelLink = 'https://gitter.im/fossasia/open-event-webapp';
  let githubIssueLink = 'https://github.com/fossasia/open-event-webapp/issues';
  var emailContent = '';

  previewExpiryDate.setTime(currDate.getTime() + 7200000); // corresponds to current date + 2 hours
  previewExpiryDate = moment.utc(previewExpiryDate).format('dddd, h A')+' (UTC)';
  downloadLinkExpiryDate.setTime(currDate.getTime() + 259200000); // corresponds to current date + 3 days
  downloadLinkExpiryDate = moment.utc(downloadLinkExpiryDate).format('dddd, MMMM Do YYYY')+' (UTC)';

  var successMesg = 'Hi ! <br>' +
    ' Your webapp has been generated <br>' +
    'You can preview it live on ' + ' link'.link(previewUrl) + '. This link expires on ' + previewExpiryDate + '<br>' +
    'You can download a zip of your website from  ' + ' here'.link(downloadUrl) + '. The download link for zip expires on ' + downloadLinkExpiryDate + '<br><br><br>' + 'Thank you for using Open Event Webapp Generator :)';

  var errorMesg = 'Hi ! <br> The cloud upload of the webapp failed. Please inform us about it on our ' + 'chat channel'.link(chanChannelLink) +  ' or file an issue on our ' +  'Github repo'.link(githubIssueLink) + '. Sorry for the inconvenience :(';

  // The Cloud upload fails so download link point to the event folder on Heroku itself which will be purged in a few hours
  if(!url) {
    downloadUrl = appUrl + 'download/' + toEmail + '/' + appName;
    emailContent = errorMesg;
  } else {
    emailContent = successMesg;
  }

  if(process.env.DEFAULT_MAIL_STRATEGY === 'SMTP') {
    const smtpConfig = {
      host: process.env.SMTP_HOST || config.SMTP_HOST,
      port: process.env.SMTP_PORT || config.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME || config.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD || config.SMTP_PASSWORD
      }
    };
    const transporter = nodemailer.createTransport(smtpTransport(smtpConfig));

    return transporter.sendMail({
      from: process.env.DEFAULT_FROM_EMAIL,
      to: toEmail,
      subject: subject,
      html: emailContent
    }).then((response) => {
      mailSendStatus = 1;
      console.log('Successfully sent Email');
      console.log(response);
      return {'url': url, 'mail': mailSendStatus};
    }).catch((err) => {
      console.log('Error sending Email', err);
      return {'url': url, 'mail': mailSendStatus};
      });
  }
  const fromEmail = new helper.Email(process.env.DEFAULT_FROM_EMAIL);
  const recipientEmail = new helper.Email(toEmail);
  const content = new helper.Content('text/html', emailContent);
  const mail = new helper.Mail(fromEmail, subject, recipientEmail, content);
  const requestBody = mail.toJSON();
  const request = sg.emptyRequest();

  request.host = 'api.sendgrid.com';
  request.method = 'POST';
  request.path = '/v3/mail/send';
  request.body = requestBody;
  console.log(request);
  return sg.API(request)
    .then((response) => {
      mailSendStatus = 1;
      console.log(response.statusCode);
      console.log(response.body);
      console.log(response.headers);
      return {'url': url, 'mail': mailSendStatus};
    })
    .catch((err) => {
      console.log('Error sending Email', err);
      return {'url': url, 'mail': mailSendStatus};
    });
}

function uploadAndsendMail(toEmail, appName, socket, done) {
  const file = distHelper.distPath + '/' + toEmail + '/event.zip';

  appName = appName.split(' ').join('_');
  const fileName = uuid.v4() + '/' + appName + '.zip';

  uploadToS3(file, fileName, socket)
    .then((data) => {
      logger.addLog('Success', 'Upload successful to s3', socket);
      data.Location = decodeURIComponent(data.Location);
      console.log('Upload Success', data.Location);
      return emailSend(toEmail, data.Location, appName);
    })
    .catch((err) => {
      console.log('Error', err);
      logger.addLog('Info', 'Failed while uploading the zip. No Amazon S3 keys found', socket);
      return emailSend(toEmail, null, appName);
    })
    .then((obj) => {
      return done(obj);
    });
}

module.exports = {
  uploadAndsendMail
};
