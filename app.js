/**
 * Created by championswimmer on 28/5/15.
 */
'use strict';
// Declare app level module which depends on views, and components


var openevent = angular.module('openevent',
    [
        'ui.router',
        'ngStorage',
        'ngMaterial',
        'oe.sidenav',
        'oe.sessions',
        'oe.speakers',
        'oe.tracks',
        'oe.sponsors',
        'oe.map'
    ]);

openevent.config(['$urlRouterProvider', '$httpProvider', function($urlRouterProvider, $httpProvider) {

    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $urlRouterProvider.otherwise('/sessions');
    }]);
openevent.controller("AppController", ['$mdSidenav', '$mdMedia', function($mdSidenav, $mdMedia) {
    this.appTitle = config.title;
    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
}]);
