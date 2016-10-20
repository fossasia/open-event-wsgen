"use strict";
var fs = require('fs');
var io = require('socket.io-client');
var request = require('request');

var client = io.connect('http://localhost:5000/');
var i = 1;
client.on('connect', function () {

    if (i == 1) {
        i = 0;
        var data = {
            name: process.argv[2] || 'testapp',
            email: 'a@a.com',
            theme: 'light',
            datasource: 'eventapi',
            assetmode: 'download',
            apiendpoint: process.argv[3] || "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/" || process.env.GH_ENDPOINT
        }
        client.emit('live', data);
    }
    client.close();
});




