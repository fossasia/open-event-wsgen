/**
 * Created by championswimmer on 15/6/15.
 */

var sponsorsModule = angular.module('oe.sponsors', ['ui.router']);

sponsorsModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('/sponsors', {
        url: '/sponsors',
        templateUrl: 'app/components/sponsors/sponsors.html',
        controller: 'SponsorsController'
    });
}]);

sponsorsModule.controller('SponsorsController',
    ['$sessionStorage', '$rootScope', 'ApiJsonFactory',
    function($sessionStorage, $rootScope, ApiJsonFactory) {

        var sc = this;
        sc.$storage = $sessionStorage;
        if ( sc.$storage.sponsors === null ||
            typeof(sc.$storage.sponsors) == 'undefined')
        {
            sc.$storage.sponsors = [];
        }
        sc.Sponsors = sc.$storage.sponsors;

        if (sc.Sponsors.length === 0) {
            ApiJsonFactory.getJson('sponsors')
                .then(function (response) {
                    sc.Sponsors = response.data.sponsors;
                    sc.$storage.sponsors = sc.Sponsors;
                }, function (error) {
                    console.error(error);
                });
        }

}]);
