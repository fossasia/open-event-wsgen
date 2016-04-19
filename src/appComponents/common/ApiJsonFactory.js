/**
 * Created by championswimmer on 29/5/15.
 */
(function () {

"use strict";
const commonFactories = angular.module("openevent");

commonFactories.factory("ApiJsonFactory", ["$q", "$http", function ($q, $http) {

const config ;
const baseUrl = `(config.use_testApi ? "testapi/" : config.apiBaseGetUrl) event/ ${config.eventId}`;

        return {
            getJson: function ($apiEndpoint) {
                let endpoint = "";

              if ($apiEndpoint === "event" && !config.use_testApi) {
                 
                  endpoint = baseUrl;
                
              } 
              else {
                 
                  endpoint = baseUrl + "/" + $apiEndpoint;
                
              }
              const deferred = $q.defer(),

              const httpPromise = $http.get(endpoint);
              httpPromise.then(function (response) {

                  deferred.resolve(response);

              }, function (error) {
                    // console.error(error);
              });
                return deferred.promise;

            }
            
        };

    }]);

})();