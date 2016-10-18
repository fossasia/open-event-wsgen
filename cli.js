"use strict";
var fs = require('fs');
var io = require('socket.io-client');
var request = require('request');

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
            apiendpoint: "https://raw.githubusercontent.com/fossasia/open-event/master/sample/FOSSASIA16/" || process.env.GH_ENDPOINT
        }
        client.emit('live', data);
    }
    client.close();
});


