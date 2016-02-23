angular
    .module('oe.twitterwall')
    .filter('parseUrl',parseUrl);

function parseUrl(){
  return function( items, userAccessLevel) {
        console.log(items)
        var n = items.search(/@/i);
        if(n!=-1){
             var v=items.slice(n);
             var m=v.substr(0,v.indexOf(" "))
        }
       
        console.log(m);

     }
};
