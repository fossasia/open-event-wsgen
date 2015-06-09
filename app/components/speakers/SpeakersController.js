/**
 * Created by championswimmer on 29/5/15.
 */

var speakersModule = angular.module('oe.speakers', ['ui.router']);

speakersModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('/speakers', {
        url: '/speakers',
        templateUrl: 'app/components/speakers/speakers.html',
        controller: 'SpeakersController'
    })
}]);

speakersModule.controller('SpeakersController', 
	['$rootScope', 'ApiJsonFactory', function($rootScope, ApiJsonFactory) {
		var sc = this;
		sc.Speakers = [];

		ApiJsonFactory.getJson('speakers')
		.then(function (response) {
            sc.Speakers = response.data.speakers;
        }, function (error) {
            console.error(error);
        });

}]);