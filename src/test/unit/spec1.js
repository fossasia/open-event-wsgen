describe("app", function() {
    var $rootScope;
    var $controller;
    beforeEach(module("openevent"));
    beforeEach(inject(function($injector) {

        $rootScope = $injector.get('$rootScope');
        $controller = $injector.get('$controller');
        $scope = $rootScope.$new();

    }));
    beforeEach(inject(function($controller) {
        AppController = $controller("AppController");

    }));

    it("It will describe the title variable", function() {
        expect(AppController.appTitle).toBe(config.title);
        expect(openevent.totalDays).toBe(0);
    });

});