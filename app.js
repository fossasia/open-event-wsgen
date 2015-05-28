/**
 * Created by championswimmer on 28/5/15.
 */

function AppComponent() {}
AppComponent.annotations = [
    new angular.ComponentAnnotation({
        selector: 'open-event'
    }),
    new angular.ViewAnnotation({
        template: '<h1>Open Event</h1>'
    })
];
document.addEventListener('DOMContentLoaded', function() {
    angular.bootstrap(AppComponent);
});

