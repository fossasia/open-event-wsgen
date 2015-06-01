/**
 * Created by championswimmer on 28/5/15.
 */
'use strict';
// Declare app level module which depends on views, and components


var openevent = angular.module('openevent',
    [
        'ui.router',
        'ui.bootstrap',
        'ui.router.tabs',
        'oe.sessions',
        'oe.speakers'
    ]);

openevent.config(['$urlRouterProvider', '$httpProvider', function($urlRouterProvider, $httpProvider) {

    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];

    //$urlRouterProvider.otherwise('/sessions');
    }]);

openevent.controller("AppController", function($state) {
    var ac = this;
    ac.appTitle = config.title;
    ac.tabs = [
        {
            heading: 'Sessions',
            route: 'sessions'
        },
        {
            heading: 'Speakers',
            route: 'speakers'
        },
        /*{
            heading: 'Tracks',
            route: 'tracks'
        }*/
    ];
    
});
