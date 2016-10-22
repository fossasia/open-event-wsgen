'use strict';

const request=require('request');
const ORGA_SERVER_URL= 'https://open-event-dev.herokuapp.com/';

exports.notify=(data, cb) => {
  request({
        uri:ORGA_SERVER_URL+'/api/v2/events/1/notifications',
        method:'POST',
        json: data
    },(err,res,body) => {
        cb(err,res,body);
    });
};
