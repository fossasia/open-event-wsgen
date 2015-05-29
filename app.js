/**
 * Created by championswimmer on 28/5/15.
 */
'use strict';
// Declare app level module which depends on views, and components


var openevent = angular.module('openevent',
    [
        'ngRoute',
        'ui.bootstrap',
        'oe.sessions',
        'oe.speakers'
    ]);

openevent.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.otherwise({redirectTo: '/sessions'});
    }]);
openevent.controller("appCtrl", function($scope) {
    $scope.appTitle = config.title;
})