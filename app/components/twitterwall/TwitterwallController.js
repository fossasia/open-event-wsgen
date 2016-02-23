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



/*created By aayusharora on 17/2/16*/
twitModule.controller('TwitterwallController',
    ['$state','$http','$scope',function($state,$http,$scope){
      $scope.fetched=false;
        $http({
  method: 'GET',
  url: 'http://loklak.org/api/search.json?q=fossasia',
  cache:true
}).then(function successCallback(response) {
     $scope.array=[];
     console.log(response);
     $scope.array=response.data.statuses;
     $scope.fetched=true;
     
  }, function errorCallback(response) {
  
  });
    }
      
            
    ]
);