var twitModule = angular.module('oe.twitterwall', ['ui.router']);

twitModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('twitterwall', {
        url: '/twitterwall',
        templateUrl: 'app/components/twitterwall/twitterwall.html',
        controller: 'TwitterwallController'
    });
}]);

/*created By aayusharora on 21/3/16*/
twitModule.controller('TwitterwallController',
    ['$http','$scope','TwitterJsonFactory',function($http,$scope,TwitterJsonFactory){
      $scope.array="";
       TwitterJsonFactory.getJson()
        .then(function(response){
          $scope.array=response.data.statuses;
          if($scope.array){
              $scope.fetched=true;
            }
          });          
  $scope.$watch('array',function(){
    $scope.array=$scope.array;
      if($scope.array){
        $scope.$broadcast('array',$scope.array);
      }
         });
      
      }
    ]
);
