/**
 * Created by championswimmer on 15/6/15.
 */

var mapModule = angular.module('oe.map', ['ui.router', 'leaflet-directive']);

mapModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('map', {
        url: '/map',
        templateUrl: 'app/components/map/map.html',
        controller: 'MapController'
    });
}]);

mapModule.controller('MapController',
    ['$rootScope', '$sessionStorage',
        function($rootScope, $sessionStorage) {

    var mc = this;
    mc.Event = $sessionStorage.event;

    angular.extend($rootScope, {
        defaults: {
            scrollWheelZoom: false
        },
        locationCenter: {
            lat: mc.Event.latitude,
            lng: mc.Event.longitude,
            zoom: 12
        },
        markers: {
            locationMarker: {
                lat: mc.Event.latitude,
                lng: mc.Event.longitude,
                message: mc.Event.location_name,
                focus: true,
                draggable: false
            }
        }
    });
	

}]);

mapModule.controller('AddressController', 
	['$scope', '$sessionStorage',
		function($scope, $sessionStorage) { 
	var mc = this;
	mc.Event = $sessionStorage.event;
  $scope.street = mc.Event.address.street;
  $scope.locality = mc.Event.address.locality; 
  $scope.city = mc.Event.address.city; 
  $scope.country = mc.Event.address.country; 
  $scope.postalCode = mc.Event.address.postalCode; 
}]);