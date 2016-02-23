angular
    .module('oe.twitterwall')
    .directive('onErrorSrc',onErrorSrc);

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