/**
 * Created by championswimmer on 15/6/15.
 */

var mapModule = angular.module('oe.map', ['ui.router']);

mapModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('/map', {
        url: '/map',
        templateUrl: 'app/components/map/map.html',
        controller: 'MapController'
    });
}]);

mapModule.controller('MapController', [function() {

}]);
