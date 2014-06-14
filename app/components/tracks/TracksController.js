/**
 * Created by championswimmer on 29/5/15.
 */

var tracksModule = angular.module('oe.tracks', ['ui.router']);

tracksModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('/tracks', {
        url: '/tracks',
        templateUrl: 'app/components/tracks/tracks.html',
        controller: 'TracksController'
    })
}]);

tracksModule.controller('TracksController', 
	['$sessionStorage', '$rootScope', 'ApiJsonFactory', function($sessionStorage, $rootScope, ApiJsonFactory) {
		var tc = this;
        tc.$storage = $sessionStorage;
        if ( tc.$storage.tracks == null || typeof(tc.$storage.tracks) == 'undefined')
        {
            tc.$storage.tracks = [];
        }
        tc.Tracks = tc.$storage.tracks;

        if (tc.Tracks.length === 0) {
            ApiJsonFactory.getJson('tracks')
                .then(function (response) {
                    tc.Tracks = response.data.tracks;
                    tc.$storage.tracks = tc.Tracks;
                }, function (error) {
                    console.error(error);
                });
        }

}]);