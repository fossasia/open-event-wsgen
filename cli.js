"use strict";
var fs = require('fs');
var io = require('socket.io-client');
const config = require('./config.json');
var request = require('request').defaults({'proxy': config.proxy});

var client = io.connect('http://127.0.0.1:5000');
var i = 1;
client.on('connect', function () {

    if (i == 1) {
        i = 0;
        var data = {
            name: 'testapp',
            email: 'a@a.com',
            theme: 'light',
            datasource: 'eventapi',
            assetmode: 'download',
            apiendpoint: process.argv[3] || "https://eventyay.com/api/v1/events/6" || process.env.GH_ENDPOINT
        }
        client.emit('live', data);
    }
    client.close();
});


