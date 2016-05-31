/*  created by aayusharora on 2/3/2016   */
angular
    .module("oe.speakers")
    .directive("speakerdirective", speakerdirective);

/*  directive to display tweets after a timespan of 8000 ms.*/

speakerdirective.$inject=[ "$rootScope"];
function speakerdirective($timeout,$rootScope) {
  const directive = {
    "link": link,
    "restrict": "EA",
    "scope": {
      speakerstemplate: '=',
      newArr: '='
    },
    "templateUrl":'./src/appComponents/speakers/speakerdirective.html'
  };

  return directive;

/*  The directive link function*/

  function link(scope) {

    
}
}
