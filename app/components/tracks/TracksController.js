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
	['$rootScope', 'ApiJsonFactory', function($rootScope, ApiJsonFactory) {
		var sc = this;
		sc.Tracks = [];

		ApiJsonFactory.getJson('tracks')
		.then(function (response) {
            sc.Tracks = response.data.tracks;
        }, function (error) {
            console.error(error);
        });

}]);