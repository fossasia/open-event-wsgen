/**
 * Created by championswimmer on 29/5/15.
 */

var speakersModule = angular.module('oe.speakers', ['ui.router']);

var singleSpeaker = {};

speakersModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('speakers', {
        url: '/speakers',
        templateUrl: 'app/components/speakers/speakers.html',
        controller: 'SpeakersController'
    })
}]);

speakersModule.controller('SpeakersController', 
	['$mdDialog', '$sessionStorage', '$rootScope', 'ApiJsonFactory',
        function($mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
		var sc = this;
        if ( $sessionStorage.speakers == null || typeof($sessionStorage.speakers) == 'undefined')
        {
            $sessionStorage.speakers = [];
        }
        sc.Speakers = $sessionStorage.speakers;
        sc.showLoaders = false;

        if (sc.Speakers.length === 0) {
            sc.showLoaders = true;
            ApiJsonFactory.getJson('speakers')
                .then(function (response) {
                    sc.Speakers = response.data.speakers;
                    sc.Speakers.sort(SortUtils.sortBy(
                    	'name',
                    	false,
                    	function(a){return a.toUpperCase();}
                    	));
                    $sessionStorage.speakers = sc.Speakers;
                    sc.showLoaders = false;
                }, function (error) {
                    console.error(error);
                });
        }

        sc.showSpeaker = function(speaker, event) {
            singleSpeaker = speaker;
            $mdDialog.show({
                controller: 'SpeakerDialogController',
                templateUrl: 'app/components/speakers/speakerdialog.html',
                parent: angular.element(document.body),
                targetEvent: event,

            });
        };

}]);

speakersModule.controller('SpeakerDialogController',
    ['$mdDialog', function($mdDialog) {
        var sdc = this;
        sdc.speaker = singleSpeaker;

        sdc.speakerChips = [];
        if((sdc.speaker.country!==null)
            && (sdc.speaker.country.length > 0)) {
            sdc.speakerChips.push(
                {field: 'Country', value: sdc.speaker.country});
        }
        if((sdc.speaker.organisation!==null)
            && (sdc.speaker.organisation.length > 0)) {
            sdc.speakerChips.push(
                {field: 'Organisation', value: sdc.speaker.organisation});
        }
        if((sdc.speaker.position!==null)
            && (sdc.speaker.positionorganisation.length > 0)) {
            sdc.speakerChips.push(
                {field: 'Position', value: sdc.speaker.position});
        }


        sdc.close = function () {
            $mdDialog.hide();
        };
    }]);