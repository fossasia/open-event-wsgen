
<!DOCTYPE html>
<!--
  Note to contributors: Do not submit any changes to this page, as it is generated automatically
  from https://github.com/fossasia/open-event-scraper.
-->
<html lang="en">
<head>

  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

  <meta name="description" content="OpenTechSummit 2016 Schedule">
  <meta name="author" content="OpenTechSummit">

  <title>OpenTechSummit 2016 Schedule</title>

  <!-- Bootstrap core CSS -->
  <!-- Latest compiled and minified CSS -->
  <link rel="shortcut icon" href="{{ eventurls.ico_url }}" type="image/x-icon" />
  <link href="http://maxcdn.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css" rel="stylesheet" type="text/css" media="all"/>
  <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,600,300' rel='stylesheet' type='text/css'>
  <link href="http://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" media="all"/>
  <link rel="stylesheet" href="./css/schedule.css">

  <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
      <![endif]-->
    </head>

    <body>

    <nav class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header navbar-left pull-left">
          <a class="navbar-brand" href="{{ eventurls.main_page_url }}">
            <img alt="Logo" class="logo logo-dark" src="./{{ eventurls.logo_url }}">
          </a>
        </div>

        <div class="navbar-header navbar-right pull-right">
          <ul class="nav navbar-nav pull-left">
            {{#sociallinks}}
              {{#if show}}
                <li class="pull-left"><a href="{{url}}"><i class="fa fa-lg fa-{{icon}}"></i></a></li>
              {{/if}}
            {{/sociallinks}}
          </ul>
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse" style="margin-left:1em;margin-top:1em;">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
        </div>

        <div class="hidden-lg hidden-md hidden-sm clearfix"></div>
        <div class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-left">
            {{#days}}
            <li class="dropdown" id="day-menu">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                {{caption}} <span class="caret"></span>
              </a>
              <ul class="dropdown-menu">
                {{#tracks}}
                  <li><a href="#{{slug}}">{{title}}</a></li>
                {{/tracks}}
              </ul>
            </li>
            {{/days}}
            <li><a href="#Sponsors">Sponsors</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="row">
    <div class="col-md-offset-2 col-md-8 main">
      <div id=track-list class="container">
        {{#tracks}}
        <div class="row">
          {{#with sessions.[0]}}
          <div class="height col-md-offset-1 col-xs-2 col-md-1">
           <h6 id="text">{{start}}</h6>
          </div>
           {{/with}}
          <div style="background-color:{{{color}}}" class="item track-title col-xs-10 event col-md-7">
              <h5><u>{{title}}</u></h5>
          </div>
          <div class="pop-box">
            <div class="arrow">
            <span></span>
            </div>
            <div class="pop-container" style="color:black";>
              <div class="pop">
                  <h6 id="headline"><strong>Speakers</strong></h6>
                 {{#sessions}}
                 <div class="pop-over row">
                   
                    <div class="col-xs-3 col-md-2">
                   
                    <img src="{{photo}}" style="width:5rem; height:5rem;"/>
                    </div>
                    <div class="col-md-offset-1 col-xs-offset-1 col-xs-9 col-md-9">

                      {{speakers}}
                 
                    </div>
                </div>
                  {{/sessions}}
              </div>
            </div>
          </div>
        </div>
        {{/tracks}}
      </div>
    </div>
    <div class="col-md-2">
    </div>
    </div>
   <!-- /#session-list -->
  <div class="row">
    <div class="col-md-12 footer">
     {{#if copyright}}
     <center>
       <p>
         <a href="{{{copyright.license_url}}}"> <img src="{{{copyright.logo}}}"> </a>
         &copy; {{copyright.year}}
         <a href="{{{copyright.holder_url}}}">{{copyright.holder}}</a>
         The website and it's contents are licensed under
          <a href="{{{copyright.license_url}}}"> {{copyright.license}} </a>
       </p>
       </center>
      {{/if}}
    </div>
  </div>

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"
    integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS"
    crossorigin="anonymous">
  </script>
   <script type="text/javascript">
   $(document).ready(function(){

    $('.pop-box').hide();
    $('.item').hover(function (event) {

    event.preventDefault();
    event.stopPropagation();
    var track = $(event.target);
    var link  = track.children(0);
    var offset =$(link).offset();
    console.log(link.height());
    
    var position= offset.top-link.height()-30;
    var left= offset.left;

    if( $(window).width()>=320 && $(window).width()< 481){
      var position= offset.top-link.height()-38;  
    }
    else if( $(window).width()>= 481 && $(window).width()<641){
      var position= offset.top-link.height()-46;
    }
    else if( $(window).width()>=641 && $(window).width()< 961){

      var position= offset.top-link.height()-50;
    }
    else if( $(window).width()>=961 && $(window).width()< 1025){
      var left= left-180;
    }
    else {
         var left= left-210;
    }
    if(offset.top){
      $('.pop-box').hide();
      var p=$(this);
      $(p).next().show();
      var posY = event.pageY;
      nextOfpop=$(p).next();
        
      var toptrack = position ;
      $(nextOfpop).css({'top':toptrack,
                        'left':left
        });
      }
    $(document).mouseup(function (e)
      {
        var container = $(".pop-box");

        if (!container.is(e.target) 
            && container.has(e.target).length === 0 && (e.target)!=$('html').get(0)) 
          {
            container.hide();
          }
      });
    })
  })
    $(function() {
      $('a[href*="#"]:not([href="#"])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html, body').animate({
              scrollTop: target.offset().top
            }, 1000);
            return false;
          }
        }
      });
    });
    </script>

   <!-- /#track-list -->

</body>
</html>
