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

    <!-- Fixed navbar -->
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

    <div id="session-list" class="container">

      {{#tracks}}
      <div class="row">
        <div class="col-md-12">

          <a class="anchor" id="{{slug}}"></a>
          <h3 class="track-title">{{title}}</h3>
          <h5>{{date}}</h5>

          <ul class="list-group session-list">
            {{#sessions}}
            <li class="list-group-item" data-session-id="{{session_id}}">
              <div class="row"
              data-toggle="collapse"
              data-target="#desc-{{session_id}} .collapse"
              aria-expanded="false"
              aria-controls="desc-{{session_id}}">

              <div class="col-xs-2 col-md-1">
                <span class="time-alert session-start label label-primary">
                  {{start}}
                </span>
              </div>

              <div class="col-xs-10 col-md-11">
                <div class="clearfix">
                  <a class="anchor" name="{{session_id}}"></a>
                  <h4 class="session-title">
                    {{title}}&nbsp;
                    <a class="session-link" href="#{{session_id}}">
                      <i class="fa fa-link"></i>
                    </a>
                    <input class="inputbox" type="text" onclick="this.select()" value="http://opentechsummit.net/programm/#{{session_id}}" style="display:none;">
                    {{#if video}}
                    <a class="video-link" href="{{video}}" target="_blank">
                      <i class="fa fa-youtube-play fa-2x"></i>
                    </a>
                    {{/if}}
                    {{#if slides}}
                    <a class="slide-link" href="{{slides}}" target="_blank">
                      [Slides]
                    </a>
                    {{/if}}
                    {{#if sign_up}}
                    <a href="{{sign_up}}" class="btn btn-xs btn-sign-up"> Sign up </a>
                    {{/if}}
                  </h4>
                  <p class="session-location">
                    {{location}}
                  </p>
                </div>
                <p class="audio-player">
                  {{#if audio}}
                  <audio controls>
                    <source src="{{audio}}" type="audio/mpeg">
                  </audio>
                  {{/if}}
                </p>
                <p class="session-speakers">
                  {{#speakers_list}}
                  {{#if photo}}
                  <img src="{{photo}}" style="width:5rem; height:5rem; border-radius:50%;"/>
                  {{/if}}
                  {{/speakers_list}}
                  {{speakers}}
                </p>
                <p>
                  <span class="session-type">{{type}}</span>
                </p>
                <div id="desc-{{session_id}}">
                  <p class="collapse">
                    <span class="session-description">{{#linkify}}{{description}}{{/linkify}}</span>
                  </p>
                  <div class="session-speakers-list collapse">
                    {{#speakers_list}}
                    {{#if biography}}
                    <p class="session-speakers-less">
                      <span class="session-speaker-name">About {{name}}:</span>
                    </p>
                    <div class="session-speakers-more">
                      <p>
                        <span class="session-speaker-bio">{{#linkify}}{{biography}}{{/linkify}}</span>
                      </p>
                      <p class="session-speaker-social">
                        {{#if web}}
                        <a class="social speaker-social" href="{{{web}}}"}>
                          <i class="fa fa-home"></i> Web
                        </a>
                        {{/if}}
                        {{#if github}}
                        <a class="social speaker-social" href="{{{github}}}"}>
                          <i class="fa fa-github"></i> Github
                        </a>
                        {{/if}}
                        {{#if twitter}}
                        <a class="social speaker-social" href="{{{twitter}}}"}>
                          <i class="fa fa-twitter"></i> Twitter
                        </a>
                        {{/if}}
                        {{#if linkedin}}
                        <a class="social speaker-social" href="{{{linkedin}}}"}>
                          <i class="fa fa-linkedin"></i> LinkedIn
                        </a>
                        {{/if}}
                      </p>
                    </div>
                    {{/if}}
                    {{/speakers_list}}
                  </div>
                </div>

              </div><!-- /.row -->
            </li><!-- /.list-group-item -->
            {{/sessions}}
          </ul>
        </div><!-- /.col-md-12 -->
      </div><!-- /.row -->
      {{/tracks}}
      {{#if sponsorpics}}
      <div id="Sponsors"></div>
      <section class="sponsors">
        <div class="container">
          <div class="row">
            <div class="col-sm-12 text-center">
              <h1 class="track-title">Sponsors</h1>
            </div>
          </div>
      {{#each sponsorpics}}
        <div class="row sponsor-row">
        {{#each this}}
          <div class="{{{divclass}}}">
            <a href="{{{link}}}">
              <img class="{{{imgsize}}}" alt="{{{name}}}" src="{{{image}}}">
            </a>
        </div>
        {{/each}}
      </div> <!-- sponsor-row -->
      {{/each}}

    </div>
    </section><!-- /#session-list -->
    {{/if}}
    <div class="navbar navbar-default footer">
     {{#if copyright}}
       <p>
         <a href="{{{copyright.license_url}}}"> <img src="{{{copyright.logo}}}"> </a>
         &copy; {{copyright.year}}
         <a href="{{{copyright.holder_url}}}">{{copyright.holder}}</a>
         The website and it's contents are licensed under
          <a href="{{{copyright.license_url}}}"> {{copyright.license}} </a>
       </p>
      {{/if}}
    </div>

    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js"></script>
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"
    integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS"
    crossorigin="anonymous">
  </script>
   <script type="text/javascript">
       $(document).ready(function(){

        $('.session-link').click(function() {
          $(this).next('.inputbox').toggle().select();
        });

  });
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
</body>
</html>
