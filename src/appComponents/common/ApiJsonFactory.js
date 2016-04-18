/**
 * Created by championswimmer on 29/5/15.
 */

var commonFactories = angular.module('openevent');

commonFactories.factory('ApiJsonFactory', ['$q', '$http', function ($q, $http) {
var baseUrl = (config.use_testApi?'testapi/':config.apiBaseGetUrl) +
    'event/' + config.eventId;
        return {
            getJson: function ($apiEndpoint) {
                let endpoint;
                if (($apiEndpoint === 'event') && (!config.use_testApi)) {
                    endpoint = baseUrl;
                } else {
                    endpoint = baseUrl + '/' + $apiEndpoint;
                }
                
                var deferred = $q.defer(),
                    httpPromise = $http.get(endpoint);
                httpPromise.then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    console.error(error);
                });
                return deferred.promise;
            }
        };
    }]);