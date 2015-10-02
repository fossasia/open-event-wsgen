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
	['$mdDialog','$sessionStorage', '$rootScope', 'ApiJsonFactory',
        function($mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
		var tc = this;
        if ( $sessionStorage.tracks === null ||
            typeof($sessionStorage.tracks) == 'undefined')
        {
            $sessionStorage.tracks = [];
        }
        tc.Tracks = $sessionStorage.tracks;
        tc.Sessions = $sessionStorage.sessions;
        

        if (tc.Tracks.length === 0) {
            ApiJsonFactory.getJson('tracks')
                .then(function (response) {
                    tc.Tracks = response.data.tracks;
                    $sessionStorage.tracks = tc.Tracks;
                }, function (error) {
                    console.error(error);
                });

            ApiJsonFactory.getJson('sessions')
                .then(function (response) {
                    tc.Sessions = response.data.sessions;
                    $sessionStorage.sessions = tc.Sessions;
                }, function (error) {
                    console.error(error);
                });
        }

        tc.showSession = function(track, event) {
            //singleTrack = track;
            $mdDialog.track = {
                singleTrack: track
            };
            $mdDialog.show({
                controller: 'TrackDialogController',
                templateUrl: 'app/components/tracks/trackdialog.html',
                parent: angular.element(document.body),
                targetEvent: event,

            });
        };


}]);

/*---------------------Dialog-----------------------*/

tracksModule.controller('TrackDialogController', 
    ['$mdDialog', '$sessionStorage',
        function($mdDialog, $sessionStorage) {
            var tdc = this;
            tdc.track = $mdDialog.track.singleTrack;
            tdc.allSessions = $sessionStorage.sessions;

            tdc.count = function(track, sessions){
                var count = 0;
                for(var i = 0; i < sessions.length; i++) {
                    if(track.id == sessions[i].track) {
                        count++;                    
                    }                    
                }

                return count;
            };
            
            tdc.sessionsDetail = function(track, sessions) {
                var k = 0;
                var count = tdc.count(track,sessions);
                var tsessions = new Array(count);
                for(var i = 0; i < sessions.length;i++) {
                    if(track.id == sessions[i].track) {
                        tsessions[k++] = sessions[i];
                    }
                }

                return tsessions;                
            };

            tdc.close = function () {
                $mdDialog.hide();
            };
            
    }]);