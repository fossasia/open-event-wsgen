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
		var sc = this;
        sc.$storage = $sessionStorage;
        if ( sc.$storage.tracks == null || typeof(sc.$storage.tracks) == 'undefined')
        {
            sc.$storage.tracks = [];
        }
        sc.Tracks = sc.$storage.tracks;

        if (sc.Tracks.length === 0) {
            ApiJsonFactory.getJson('tracks')
                .then(function (response) {
                    sc.Tracks = response.data.tracks;
                    sc.$storage.tracks = sc.Tracks;
                }, function (error) {
                    console.error(error);
                });
        }

}]);