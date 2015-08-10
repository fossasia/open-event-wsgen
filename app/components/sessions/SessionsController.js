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
        sc.Sessions = $sessionStorage.sessions;

        if (sc.Sessions.length === 0) {
            ApiJsonFactory.getJson('sessions')
                .then(function (response) {
                    sc.Sessions = response.data.sessions;
                    $sessionStorage.sessions = sc.Sessions;
                }, function (error) {
                    console.error(error);
                });
        }
        sc.duration = function(session) {
            var start = DateUtils.getHourMin(session.start_time);
            var end = DateUtils.getHourMin(session.end_time);

            return start + ' - ' + end;
        };
    }]);
