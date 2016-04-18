/**
 * Created by championswimmer on 29/5/15.
 */
/* exported error */

const tracksModule = angular.module("oe.tracks", ["ui.router"]);

tracksModule.config(["$stateProvider", function($stateProvider) {

  $stateProvider.state("tracks", {
    "url": "/tracks",
    "templateUrl": "appComponents/tracks/tracks.html",
    "controller": "TracksController"
  });

}]);

tracksModule.controller("TracksController", ["$mdDialog","$sessionStorage", "$rootScope", "ApiJsonFactory",
        function ($mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
          var tsc = this;

          if ($sessionStorage.tracks === null || 
            typeof $sessionStorage.tracks === "undefined")
         {

            $sessionStorage.tracks = [];
        }
        tsc.Tracks = $sessionStorage.tracks;
        tsc.Sessions = $sessionStorage.sessions;
        
        if (tsc.Tracks.length === 0) {

          ApiJsonFactory.getJson("tracks")
            .then(function (response) {

            tsc.Tracks = response.data.tracks;
            $sessionStorage.tracks = tsc.Tracks;
                
            }, function error (error) {
                    //console.error(error);
            });

          ApiJsonFactory.getJson("sessions")
            .then(function (response) {

            tsc.Sessions = response.data.sessions;
            $sessionStorage.sessions = tsc.Sessions;

            }, function (error) {
                    //console.error(error);
                });

        }

        tsc.showSession = function(track, event) {
            // singleTrack = track;
          $mdDialog.track = {
                "singleTrack": track
          };
          $mdDialog.show({
                "controller": "TrackDialogController",
                "templateUrl": "appComponents/tracks/trackdialog.html",
                "parent": angular.element(document.body),
                "targetEvent": event

          });
        };


}]);

/*---------------------Dialog-----------------------*/

tracksModule.controller("TrackDialogController", 
    ["$mdDialog", "$sessionStorage",
        function($mdDialog, $sessionStorage) {

            var tdc = this;
            tdc.track = $mdDialog.track.singleTrack;
            tdc.allSessions = $sessionStorage.sessions;

            tdc.count = function(track, sessions){

                var count = 0;

                for(var i = 0; i < sessions.length; i+=1) {

                    if(track.id === sessions[i].track) {
                        count+=1;                    
                    }  

                }
                return count;

            };
            
            tdc.sessionsDetail = function(track, sessions) {

                var k = 0;
                var count = tdc.count(track,sessions);
                var tsessions = new Array(count);
                for(var i = 0; i < sessions.length;i+=1) {

                    if(track.id === sessions[i].track) {

                        tsessions[k+=1] = sessions[i];
                    }
                }
                return tsessions;  

            };

            tdc.close = function () {

                $mdDialog.hide();

            };
            
    }]);