/**
 * Created by championswimmer on 28/5/15.
 */
'use strict';
angular.module('openevent.speakers', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/speakers', {
            templateUrl: 'app/components/speakers/speakers.html',
            controller: 'speakersCtrl'
        });
    }])
    .controller('speakersCtrl', [function() {
    }]);