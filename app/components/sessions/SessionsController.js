/**
 * Created by championswimmer on 29/5/15.
 */


var sessionsModule = angular.module('oe.sessions', ['ui.router']);

/* ----------------------------- Sessions List ---------------------------- */
var singleSession = {};
sessionsModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('sessions', {
        url: '/sessions',
        templateUrl: 'app/components/sessions/sessions.html',
        controller: 'SessionsController'
    })
}]);

sessionsModule.controller('SessionsController',
    ['$mdDialog', '$sessionStorage', '$rootScope', 'ApiJsonFactory',
        function($mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
            var sc = this;
            if ($sessionStorage.sessions === null ||
                typeof($sessionStorage.sessions) == 'undefined')
            {
                $sessionStorage.sessions = [];
            }

            sc.Sessions = new Array(openevent.totalDays);

            if ($sessionStorage.sessions.length === 0) {
                ApiJsonFactory.getJson('sessions')
                    .then(function (response) {
                        $sessionStorage.sessions = response.data.sessions;
                        for (var i = 0; i < openevent.totalDays; i+=1) {
                            sc.Sessions[i] = [];
                        }
                        $sessionStorage.sessionset = sc.Sessions;

                        for (var j = 0; j < response.data.sessions.length; j+= 1) {
                            var dayDiff = DateUtils.DateDiff.inDays(
                                $sessionStorage.event.begin,
                                response.data.sessions[j].begin);
                            sc.Sessions[dayDiff].push(response.data.sessions[j]);
                            $sessionStorage.days[dayDiff].sessions = sc.Sessions[dayDiff];
                        }
                        $sessionStorage.sessionset = sc.Sessions;

                    }, function (error) {
                        console.error(error);
                    });
            }
            sc.Days = $sessionStorage.days;
            sc.Sessionset = $sessionStorage.sessionset;

            sc.duration = function(session) {
                var start = DateUtils.getHourMin(session.begin);
                var end = DateUtils.getHourMin(session.end);

                return {start: start, end: end};
            };

            sc.showSession = function(session, event) {
                singleSession = session;
                $mdDialog.show({
                    controller: 'SessionDialogController',
                    templateUrl: 'app/components/sessions/sessiondialog.html',
                    parent: angular.element(document.body),
                    targetEvent: event,

                });
            };

        }]);

/* -------------------------- Session Dialog ----------------------- */

sessionsModule.controller('SessionDialogController', ['$mdDialog',
    function($mdDialog) {
        var sdc = this;
        sdc.session = singleSession;

        sdc.close = function () {
            $mdDialog.hide();
        };
        sdc.duration = function(session) {
            var start = DateUtils.getHourMin(session.begin);
            var end = DateUtils.getHourMin(session.end);

            return start + ' - ' + end;
        };
    }]);