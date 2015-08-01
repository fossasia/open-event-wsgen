/**
 * Created by championswimmer on 29/5/15.
 */

var tracksModule = angular.module('oe.tracks', ['ui.router']);

tracksModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('tracks', {
        url: '/tracks',
        templateUrl: 'app/components/tracks/tracks.html',
        controller: 'TracksController'
    })
}]);

tracksModule.controller('TracksController', 
	['$sessionStorage', '$rootScope', 'ApiJsonFactory',
        function($sessionStorage, $rootScope, ApiJsonFactory) {
		var tc = this;
        if ( $sessionStorage.tracks === null ||
            typeof($sessionStorage.tracks) == 'undefined')
        {
            $sessionStorage.tracks = [];
        }
        tc.Tracks = $sessionStorage.tracks;

        if (tc.Tracks.length === 0) {
            ApiJsonFactory.getJson('tracks')
                .then(function (response) {
                    tc.Tracks = response.data.tracks;
                    $sessionStorage.tracks = tc.Tracks;
                }, function (error) {
                    console.error(error);
                });
        }

}]);