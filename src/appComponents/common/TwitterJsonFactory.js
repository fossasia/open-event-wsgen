/**
 * Created by aayusharora on 2/03/2016.
 */

var commonFactories = angular.module('openevent');

commonFactories.factory('TwitterJsonFactory', ['$q', '$http', function ($q, $http) {
var twitterUrl = config.apiTwitterGetUrl;
        return {
            getJson: function () {
                var deferred = $q.defer(),
                httpPromise = $http({
                    method: 'JSONP',
                    url: twitterUrl,
                    });
                httpPromise.then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    console.error(error);
                });
                return deferred.promise;
        }
        };
    }]);