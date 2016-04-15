/**
 * Created by championswimmer on 28/5/15.
 */

// Declare app level module which depends on views, and components

const openevent = angular.module("openevent",
  [
    "ui.router",
    "ngStorage",
    "ngMaterial",
    "leaflet-directive",
    "oe.sidenav",
    "oe.sessions",
    "oe.speakers",
    "oe.tracks",
    "oe.sponsors",
    "oe.twitterwall",
    "oe.map"
  ]);

openevent.config(["$urlRouterProvider", "$httpProvider", "$mdThemingProvider", 
        function setTheme($urlRouterProvider, $httpProvider, $mdThemingProvider) {
            //$httpProvider.defaults.useXDomain = true;   
            //delete $httpProvider.defaults.headers.common["X-Requested-With"];
          $urlRouterProvider.otherwise("sessions");
          $mdThemingProvider.theme("default")
            .primaryPalette(config.themeColorPrimary)
            .accentPalette(config.themeColorAccent);

        }]);

openevent.controller("AppController",
    ["$mdSidenav", "$mdMedia", "$sessionStorage", "ApiJsonFactory",
        function($mdSidenav, $mdMedia, $sessionStorage, ApiJsonFactory) {

          const app = this;
          
          openevent.totalDays = 0;
          app.appTitle = config.title;
          app.toggleSidenav=toggleSidenav;
          


        /**
          * use for toggling the sidebar
        */
          function toggleSidenav(menuId) {

            $mdSidenav(menuId).toggle();

           }

          app.$storage = $sessionStorage;
          if (app.$storage.event === null || typeof (app.$storage.event) === "undefined")
          {

            app.$storage.event = [];
            app.$storage.days = [];

        }

          app.Event = app.$storage.event;

          if (app.Event.length === 0) {

            ApiJsonFactory.getJson("event")
            .then(function (response) {

              app.Event = response.data.events[0];
              app.$storage.event = app.Event;
              openevent.totalDays = DateUtils.DateDiff.inDays(app.Event.begin, app.Event.end) + 1;
              app.Days = [openevent.totalDays];
              for (const i = 0; i < openevent.totalDays; i+=1) {

                    app.Days[i] = {num: i, label: "Day "+ (i+1)};
                }
                app.$storage.days = app.Days;

            }, function (error) {
                console.error(error);
            });

        }

    }]);
