angular
    .module('oe.twitterwall')
    .directive('photos',photos);

function photos($timeout) {
    var directive = {
        link: link,
        restrict:'EA',
        scope:{
            array:'='
        },
         template: 
                '<div class="main-container">'+
                '<ul ng-class="{\'backgroundanimation\':true}" class="background" ng-repeat="photo in photos|limitTo :90">'+
                   '<li class="item-wrapper">'+
                    '<img  width="72px" height="72px" on-error-src="https://pbs.twimg.com/profile_images/1141238022/fossasia-cubelogo.jpg" ng-src=\'{{photo.photo}}\'>'+
                    '</li>'+
                '</ul>'+
                '</div>',
        controller:'TwitterwallController',
        controllerAs: 'vm',
        bindToController: true,
        
    };
    return directive;
     
    function link(scope, element, attrs,vm) {
        scope.array='';
        scope.photos=[];
        scope.getBackground=getBackground;
        scope.backgroundid="";
        getBackground();
        changeBackground();

        scope.$watch('backgroundid',function(newvalue,oldvalue){
            console.log(newvalue);
        })

        function getBackground(){
            scope.$watch('array',function(oldvalue,newvalue){
            for(photo in scope.array){
                if(scope.array[photo].user.profile_image_url_https){
                    var obj={
                        photo:scope.array[photo].user.profile_image_url_https,
                        id:scope.array[photo].user.user_id
                    }
                    scope.photos.push(obj);
                  
                }
            }


              console.log(scope.photos)
        })
          }
       function changeBackground(){
        scope.$on("selectedid", function (evt,id) {
        scope.backgroundid=id;
        console.log(scope.backgroundid);
        document.getElementById("")
    });
         
       }
     
        };
    }
