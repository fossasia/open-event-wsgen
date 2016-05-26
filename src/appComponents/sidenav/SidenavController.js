/**
 * Created by championswimmer on 4/6/15.
 */

var sidenavModule = angular.module("oe.sidenav", []);

sidenavModule.controller("SidenavController", ["$mdSidenav", "$mdMedia", function($mdSidenav, $mdMedia) {
    this.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };
}]);