/**
 * Created by championswimmer on 28/5/15.
 */
'use strict';
angular.module('openevent.sessions', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/sessions', {
            templateUrl: 'app/components/sessions/sessions.html',
            controller: 'sessionsCtrl'
        });
    }])
    .controller('sessionsCtrl', [function() {
    }]);