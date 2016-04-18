/*  created by aayusharora on 2/3/2016   */
angular
    .module("oe.twitterwall")
    .directive("tweet", tweet);

/*  directive to display tweets after a timespan of 8000 ms.*/

tweet.$inject=["$timeout", "$rootScope"];
function tweet($timeout,$rootScope) {
  const directive = {
    link: link,
    restrict:"EA",
    scope:{
        array:"="
    },
    template: 
            '<div class="container-tweet">'+
            '<div class="animate" ng-repeat="photo in array">'+
            '<div ng-if="photo.id_str===selectedid"  class="tweet">'+
                '<img ng-class="{\'animation\':photo.id_str===selectedid}"  class="image" on-error-src="https://pbs.twimg.com/profile_images/1141238022/fossasia-cubelogo.jpg" ng-src=\'{{photo.user.profile_image_url_https}}\'>'+
            '</div>'+
            '<div ng-if="photo.id_str===selectedid" class="heading-tweet">'+
                '{{photo.screen_name}}'+
            '</div>'+
            '<div ng-if="photo.id_str===selectedid" class="text">'+
                '{{photo.text}}'+
            '<div class="mention" ng-if="photo.id_str===selectedid" ng-repeat="mention in photo.mentions" class="info">'+
                '@{{mention}}'+
            '</div>'+
            '</div>'+
            '</div>'+
            '</div>',
    controller:"TwitterwallController",
    controllerAs: "vm",
    bindToController: true
        
    };
    return directive;
     
    function link(scope) {
        scope.array="";
        scope.getObject=getObject;
        scope.selectedid="";
        scope.createdAt="";
        scope.tweetNumber=0;
        scope.changeTweet=changeTweet;
        scope.callchangetweet=callchangetweet;
        scope.even=false;
         
        function callchangetweet(){
                $timeout(changeTweet,8000);
        }
        function changeTweet(){
            if(scope.tweetNumber!==90){
                scope.tweetNumber=scope.tweetNumber + 1;
                scope.selectedid=scope.array[scope.tweetNumber].id_str;
                $rootScope.$broadcast("selectedid",scope.selectedid);
                callchangetweet();
            }
            else {
                scope.tweetNumber=0;    
                callchangetweet();
            }
            }
       
        function getObject(){
                scope.$watch("array",function(){
                if(scope.array){
                    scope.selectedid=scope.array[1].id_str;
                    changeTweet();
                }
            });
        }
        getObject();
        scope.$on("array",function(args,message){
            scope.array=message;
        });
           
        }
    }
