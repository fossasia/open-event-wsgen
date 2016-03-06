describe("Sessions", function(){ //describe your object type
    
    //declare controller
  var $controller,
    scope,
    $rootScope,
    $sessionStorage,
    ApiJsonFactory,
    $mdDialog;


  beforeEach(module("oe.sessions")); //load module

  beforeEach(inject(function($injector, _ApiJsonFactory_) { //inject the controller
    $controller = $injector.get("$controller");
    $mdDialog = $injector.get("$mdDialog");
    $rootScope = $injector.get("$rootScope");
    $sessionStorage = $injector.get("$sessionStorage");
    ApiJsonFactory = _ApiJsonFactory_;
    scope = $rootScope.$new();
    var ctrlLoader = function () {
      $controller("SessionsController", {
        $scope: scope,
        $mdDialog: $mdDialog
      });
    };
    });
  }));


  it("should order the sessions chronologically", function() { //write tests

    ctrlLoader();
    var sessions = scope.Sessions;
    //session titles in order: each title is organized in sub array for day
    var titles = [
                ["Die Abschaffung der Wahrheit", 
                "I am as old as the Web and this is what I want.", 
                "Empowerment by Fashion: Feministische Mode im Netz",
                "Die fünfte Gewalt. Die Macht der vernetzten Vielen",
                "Finding Europe: Collaborative Journalism in Times of Crisis",
                "Challenging Europe and the World: How China is Creating its Own Web (Experience)",
                "Ceci n'est pas un tweet - Vom Lustigsein in 140 Zeichen"],
      
                ["Kontaktlos – Mobile Payment in Europa",
                "Die Unsichtbaren – Migration in Europa",
                "Wie Privat ist zu Privat? – Die tägliche Entscheidung eines Familien-Bloggers",
                "Digitaler Journalismus: Vom Innovationsgeist zur Aufbruchsstimmung"],
      
                ["Fashion + Tech Daily Review Day 3",
                "The Dark Side of Healthcare Innovation: 5 Uneasy Questions We Need to Ask Now",
                "Wider die Bewilligungskultur im Netz",
                "Fremd gehen immer nur die anderen – Liebe und Beziehung in Zeiten der Digitalität",
                "Are we finally becoming human?",
                "Learn Do Share – Open Design Game",
                "Unblinding Europe: Klinische Studiendaten ans Licht!",
                "States think we're stupid: Internet censorship around Europe since ACTA"]
               ];
    
    for(var i = 0; i < sessions.Days; i++) {
      for(var j = 0; j < titles[i].length; j++) {
        expect(sessions.Days[i+2].sessions[j].title).toEqual(titles[i][j]);
      }
    }

  });


});