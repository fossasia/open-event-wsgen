/**
 * Created by championswimmer on 29/5/15.
 */

var sessionsModule = angular.module('oe.sessions', ['ngRoute']);

sessionsModule.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/sessions', {
        templateUrl: 'app/components/sessions/sessions.html',
        controller: 'SessionsController'
    })
}]);

sessionsModule.controller('SessionsController',
    ['$scope', '$rootScope', 'ApiJsonFactory', function($scope, $rootScope, ApiJsonFactory) {
    $scope.Sessions = {};
    ApiJsonFactory.getJson('sessions')
        .then(function (response) {
            $scope.Sessions = response.data.sessions;
        }, function (error) {
            console.error(error);
        });
}]);