/**
 * Created by championswimmer on 29/5/15.
 */

var sessionsModule = angular.module('oe.sessions', ['ui.router']);

sessionsModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('/sessions', {
        url: '/sessions',
        templateUrl: 'app/components/sessions/sessions.html',
        controller: 'SessionsController'
    })
}]);

sessionsModule.controller('SessionsController',
    ['$rootScope', 'ApiJsonFactory', function($rootScope, ApiJsonFactory) {
        var sc = this;
        sc.Sessions = [];

        ApiJsonFactory.getJson('sessions')
        .then(function (response) {
            sc.Sessions = response.data.sessions;
        }, function (error) {
            console.error(error);
        });

        sc.duration = function(session) {
            var start = DateUtils.getHourMin(session.timestart);
            var end = DateUtils.getHourMin(session.timeend);

            return start + ' - ' + end;
        }
}]);