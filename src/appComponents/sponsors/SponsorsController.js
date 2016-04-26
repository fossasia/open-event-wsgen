/**
 * Created by championswimmer on 15/6/15.
 */

var sponsorsModule = angular.module('oe.sponsors', ['ui.router']);

sponsorsModule.config(['$stateProvider', function($stateProvider) {

    $stateProvider.state('sponsors', {
      url: '/sponsors',
      templateUrl: 'appComponents/sponsors/sponsors.html',
      controller: 'SponsorsController'
    });

}]);

sponsorsModule.controller('SponsorsController',
    ['$sessionStorage', '$rootScope', 'ApiJsonFactory',
    function($sessionStorage, $rootScope, ApiJsonFactory) {

        var sc = this;
        $sessionStorage = $sessionStorage;
        if ( $sessionStorage.sponsors === null ||
            typeof ($sessionStorage.sponsors) === 'undefined')
        {
            $sessionStorage.sponsors = [];
        }
        sc.Sponsors = $sessionStorage.sponsors;

        if (sc.Sponsors.length === 0) {

            ApiJsonFactory.getJson('sponsors')
                .then(function (response) {
                    sc.Sponsors = response.data.sponsors;
                    $sessionStorage.sponsors = sc.Sponsors;
                }, function (error) {
                    // console.error(error);
                });

        }

}]);
