/**
 * Created by championswimmer on 29/5/15.
 */
var commonFactories = angular.module('openevent');

commonFactories.factory('ApiJsonFactory', function ($q, $http) {
        return {
            getJson: function ($apiEndpoint) {
                var deferred = $q.defer(),
                    httpPromise = $http.get(config.apiBaseGetUrl + $apiEndpoint);

                httpPromise.then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    console.error(error);
                });

                return deferred.promise;
            }
        };
    });