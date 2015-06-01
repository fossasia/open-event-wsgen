/**
 * Created by championswimmer on 29/5/15.
 */

var baseUrl = config.apiBaseGetUrl; 
if (config.use_testApi) {
    baseUrl = "testapi/event/3/";
}
var commonFactories = angular.module('openevent');

commonFactories.factory('ApiJsonFactory', ['$q', '$http', function ($q, $http) {
        return {
            getJson: function ($apiEndpoint) {
                var deferred = $q.defer(),
                    httpPromise = $http.get(baseUrl + $apiEndpoint);

                httpPromise.then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    console.error(error);
                });

                return deferred.promise;
            }
        };
    }]);