angular
    .module('oe.twitterwall')
    .directive('onErrorSrc',onErrorSrc);
/*directive to replace broken images coming from loklak server by a hardcoded image*/
    function onErrorSrc(){
        var directive = {
            link: link,
            restrict:'EA'
        
        };
    return directive;
        function link(scope, element, attrs) {
          element.bind('error', function() {
            if (attrs.src != attrs.onErrorSrc) {
              attrs.$set('src', attrs.onErrorSrc);
            }
          });
        }
}