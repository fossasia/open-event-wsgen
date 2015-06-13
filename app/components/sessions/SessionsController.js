/**
 * Created by championswimmer on 29/5/15.
 */


var sessionsModule = angular.module('oe.sessions', ['ui.router']);

var singleSession = {};
sessionsModule.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('/sessions', {
        url: '/sessions',
        templateUrl: 'app/components/sessions/sessions.html',
        controller: 'SessionsController'
    })
}]);

sessionsModule.controller('SessionsController',
    ['$mdDialog', '$sessionStorage', '$rootScope', 'ApiJsonFactory', function($mdDialog, $sessionStorage, $rootScope, ApiJsonFactory) {
        var sc = this;
        sc.$storage = $sessionStorage;
        if (typeof(sc.$storage.sessions) == 'undefined' || sc.$storage.sessions == null)
        {
            sc.$storage.sessions = [];
        }
        sc.Sessions = sc.$storage.sessions;

        if (sc.Sessions.length === 0) {
            ApiJsonFactory.getJson('sessions')
                .then(function (response) {
                    sc.Sessions = response.data.sessions;
                    sc.$storage.sessions = sc.Sessions;
                }, function (error) {
                    console.error(error);
                });
        }
        sc.duration = function(session) {
            var start = DateUtils.getHourMin(session.timestart);
            var end = DateUtils.getHourMin(session.timeend);

            return start + ' - ' + end;
        };

        sc.showSession = function(session, event) {
            singleSession = session;
            $mdDialog.show({
                controller: 'SessionDialogController',
                templateUrl: 'app/components/sessions/sessiondialog.html',
                parent: angular.element(document.body),
                targetEvent: event,

            });
        };

    }]);

sessionsModule.controller('SessionDialogController', ['$mdDialog', function($mdDialog) {
    var sdc = this;
    sdc.session = singleSession;

    sdc.close = function () {
        $mdDialog.hide();
    };
}]);

