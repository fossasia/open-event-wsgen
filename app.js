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
        'leaflet-directive',
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
    $urlRouterProvider.otherwise('sessions');
    }]);
openevent.controller('AppController',
    ['$mdSidenav', '$mdMedia', '$sessionStorage', 'ApiJsonFactory',
        function($mdSidenav, $mdMedia, $sessionStorage, ApiJsonFactory) {
    var app = this;
    app.appTitle = config.title;
    app.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

    app.$storage = $sessionStorage;
    if ( app.$storage.event === null ||
        typeof(app.$storage.event) == 'undefined')
    {
        app.$storage.event = [];
    }
    app.Event = app.$storage.event;

    if (app.Event.length === 0) {
        ApiJsonFactory.getJson('event')
            .then(function (response) {
                app.Event = response.data.events[0];
                app.$storage.event = app.Event;
            }, function (error) {
                console.error(error);
            });
    }
}]);
