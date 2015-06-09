/**
 * Created by championswimmer on 28/5/15.
 */
'use strict';
// Declare app level module which depends on views, and components


var openevent = angular.module('openevent',
    [
        'ngRoute',
        'ngMaterial',
        'oe.sidenav',
        'oe.sessions',
        'oe.speakers',
        'oe.tracks'
    ]);

openevent.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.otherwise({redirectTo: '/sessions'});
    }]);
openevent.controller("AppController", ['$mdSidenav', '$mdMedia', function($mdSidenav, $mdMedia) {
    this.appTitle = config.title;
    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
}]);
