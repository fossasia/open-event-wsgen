/**
 * Created by championswimmer on 29/5/15.
 */

var speakersModule = angular.module('oe.speakers', ['ui.router']);

var singleSpeaker = {};

speakersModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('speakers', {
        url: '/speakers',
        templateUrl: './src/appComponents/speakers/speakers.html',
        controller: 'SpeakersController'
    });
}]);

speakersModule.controller('SpeakersController',
	['$scope','$mdDialog', '$sessionStorage', '$rootScope', 'ApiJsonFactory',
        function($scope,$mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
		var sc = this;
            $scope.speakerstemplate=[];
            var request=ApiJsonFactory.getJson('speakers')
                .then(function (response) {
                    $scope.speakerstemplate = response.data.speakers;

                }, function (error) {
                    console.error(error);
                });
         request.then(function(data){
         	 function chunk(arr, size) {
  				$scope.newArr = [];
  				for (var i=0; i<arr.length; i+=size) {
    				$scope.newArr.push(arr.slice(i, i+size));
  				}
  				return $scope.newArr;
				}
             $scope.chunkedData = chunk($scope.speakerstemplate, 3);
             console.log($scope.newArr);
         })
         
            
			
}]);

speakersModule.controller('SpeakerDialogController',
    ['$mdDialog', '$sessionStorage', function($mdDialog, $sessionStorage) {
        var sdc = this;
        sdc.speaker = $mdDialog.speak.singleSpeaker;
        sdc.allSessions = $sessionStorage.sessions;

        sdc.speakerChips = [];
        if(!(sdc.speaker.country === undefined || sdc.speaker.country !== null)
            && (sdc.speaker.country.length > 0)) {
            sdc.speakerChips.push(
                {field: 'Country', value: sdc.speaker.country});
        }
        if(!(sdc.speaker.organisation === undefined || sdc.speaker.organisation === null)
            && (sdc.speaker.organisation.length > 0)) {
            sdc.speakerChips.push(
                {field: 'Organisation', value: sdc.speaker.organisation});
        }
        if(!(sdc.speaker.position === undefined || sdc.speaker.position === null)
            && (sdc.speaker.position.length > 0)) {
            sdc.speakerChips.push(
                {field: 'Position', value: sdc.speaker.position});
        }

        sdc.count = function(speaker, sessions){
            var count = sessions.filter(function(session){
                return session.speakers.filter(function(sp){
                          return sp.id === speaker.id;
                 })
                 .length > 0;
            }).length;
            return count;
        };

        sdc.sessionsDetail = function(speaker, sessions) {

            var spSessions = sessions.filter(function(session){
                 return session.speakers.filter(function(sp){
                          return sp.id === speaker.id;
                 })
                 .length > 0;
            });

            return spSessions;
        };

        sdc.showSession = function(session, event) {
            $mdDialog.session = {
                singleSession: session
            };
            $mdDialog.show({
                controller: 'SessionDialogController',
                templateUrl: './src/appComponents/sessions/sessiondialog.html',
                parent: angular.element(document.body),
                targetEvent: event

            });
        };

        sdc.close = function () {
            $mdDialog.hide();
        };
    }]);
