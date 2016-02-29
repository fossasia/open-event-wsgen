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
    ['$state','$http','$timeout','$scope','TwitterJsonFactory',function($state,$http,$timeout,$scope,TwitterJsonFactory){
       $scope.array=[];
      $scope.fetched=false;
      if($scope.array.length==0){
        TwitterJsonFactory.getJson()
        .then(function(response){
          $scope.array=response.data.statuses;
          if($scope.array){
              $scope.fetched=true;
            }
          })
        }
      }
    ]
);
