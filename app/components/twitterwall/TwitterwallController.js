/**
 * Created by championswimmer on 9/8/15.
 */

var twitModule = angular.module('oe.twitterwall', ['ui.router']);

twitModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('twitterwall', {
        url: '/twitterwall',
        templateUrl: 'app/components/twitterwall/twitterwall.html',
        controller: 'TwitterwallController'
    });
}]);

twitModule.controller('TwitterwallController',
    ['$rootScope', '$sessionStorage', '$scope',
        function($scope, $rootScope, $sessionStorage) {

            var tc = this;
            $scope.hashtag = 'fossasia';

        }
    ]
);