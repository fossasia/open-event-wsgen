/**
 * Created by championswimmer on 29/5/15.
 */


var sessionsModule = angular.module("oe.sessions", ["ui.router"]);

/* ----------------------------- Sessions List ---------------------------- */
var singleSession = {};
sessionsModule.config(["$stateProvider", function($stateProvider) {
    $stateProvider.state("sessions", {
      "url": "/sessions",
      "templateUrl": "appComponents/sessions/sessions.html",
      "controller": "SessionsController"
    });

}]);

sessionsModule.controller("SessionsController",
    ["$mdDialog", "$sessionStorage", "$rootScope", "ApiJsonFactory",
        function($mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
<<<<<<< HEAD
          var sec = this;

            if ( $sessionStorage.sessions === null || typeof ( $sessionStorage.sessions) === "undefined")
=======
            var sc = this;
            if ($sessionStorage.sessions === null ||
                typeof ($sessionStorage.sessions) === "undefined")
>>>>>>> bcbd99087570d5c86a2e2e39515e4433909e7216
            {
                $sessionStorage.sessions = [];
            }
            sec.showLoaders = false;
            sec.Sessions = new Array(openevent.totalDays);
            sec.Days = $sessionStorage.days;

<<<<<<< HEAD
            if ( $sessionStorage.sessions.length === 0) {
                sec.showLoaders = true;
=======
            sc.showLoaders = false;
            sc.Sessions = new Array(openevent.totalDays);
            sc.Days = $sessionStorage.days;

            if ($sessionStorage.sessions.length === 0) {
                sc.showLoaders = true;
>>>>>>> bcbd99087570d5c86a2e2e39515e4433909e7216
                ApiJsonFactory.getJson("sessions")
                    .then(function (response) {
                        $sessionStorage.sessions = response.data.sessions;
                        for (var i = 0; i < openevent.totalDays; i+=1) {
                            sec.Sessions[i] = [];
                        }
                        $sessionStorage.sessionset = sec.Sessions;

                        for (var j = 0; j < response.data.sessions.length; j+= 1) {
                            var dayDiff = DateUtils.DateDiff.inDays(
                                $sessionStorage.event.begin,
                                response.data.sessions[j].begin);
                            //Filter out any mistakenly entered sessions outside date range
                            if (dayDiff>openevent.totalDays || dayDiff < 0) {
                                console.log("Session date = " + dayDiff
                                    +" outside event date range = "
                                    + openevent.totalDays);
                                continue;
                            }
                            sec.Sessions[dayDiff].push(response.data.sessions[j]);
                            $sessionStorage.days[dayDiff].sessions = sec.Sessions[dayDiff];
                            $sessionStorage.days[dayDiff].sessions.sort(SortUtils.sortBy(
                            	"begin",
                            	false,
                            	function(a){return a;}
                            	));
                        }
                        sec.showLoaders = false;
                        sec.Days = $sessionStorage.days;

                    }, function (error) {
                        console.error(error);
                    });
            }

            sec.duration = function(session) {
                var start = DateUtils.getHourMin(session.begin);
                var end = DateUtils.getHourMin(session.end);

                return {start: start, end: end};
            };

            sec.showSession = function(session, event) {
                $mdDialog.session = {
                    singleSession: session
                };
                $mdDialog.show({

                    "controller": "SessionDialogController",
                    "templateUrl": "appComponents/sessions/sessiondialog.html",
                    "parent": angular.element(document.body),
                    "targetEvent": event,

                });
            };

        }]);

/* -------------------------- Session Dialog ----------------------- */

sessionsModule.controller("SessionDialogController", ["$mdDialog",
    function($mdDialog) {
        var sdc = this;
        sdc.session = $mdDialog.session.singleSession;

        sdc.close = function () {
            $mdDialog.hide();
        };
        sdc.duration = function(session) {
            var start = DateUtils.getHourMin(session.begin);
            var end = DateUtils.getHourMin(session.end);

            return start + " - " + end;
        };
    }]);