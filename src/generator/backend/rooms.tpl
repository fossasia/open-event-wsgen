
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
  <div class="container">
    <div class="row">
      <div class="col-md-offset-2 col-md-8 main" style="margin-top:8%">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Session Name</th>
              <th>Room Name</th>
            </tr>
          </thead>
          <tbody>
            {{#roomsinfo}}
            <tr>
            {{#if sessionDetail}}
              <th>{{Hall}}</th>
            {{/if}}
            </tr>
            {{#each sessionDetail}}
            <tr>
              
              <td>
                {{date}} 
              </td>
              <td>
                {{name}}
              </td>
             
            </tr>
             {{/each}}
          {{/roomsinfo}}
          </tbody>
        </table>
      </div>
    </div>  
  </body>
</html> 