
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
<style>
  
.card{
  margin-top:30%;
    width: 250px;
    height: 448px;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 4px;
    box-shadow: 0 0.125em 0.275em 0 rgba(0,0,0,0.125);
}
.card-img-top{
  width:248px;
  height:248px;
  margin:0 auto;
  overflow: hidden;
  display:block;
}
.card-block{
  margin:7%;
  height:530px;

}
.card-text{
  color: #2482d3;
    overflow: hidden;
}

</style>
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
       {{#tracks}}
        {{#sessions}}
            {{#speakers_list}}
            <div class="col-md-4">
                <div class="center card">
                     {{#if photo}}
                    <img class="card-img-top" src="{{photo}}" style="width:5rem; height:5rem; border-radius:50%;"/>
                    {{/if}}
                 <div class="card-block">
                    <center><h3 class="card-text">{{../title}}</h3></center>
                    <center><h4 class="card-text org">{{organisation}}</h4></center>
                    <div class="row">
                    <div class="text-center col-md-12">
                        
                    </div>
                    </div>
                    </br>
                    <div class="text-center row">Read More ...</div>
                   
                 </div>  
                </div>
            </div>
            {{/speakers_list}}
        </div>
        {{/sessions}}
        {{/tracks}}
</div>

  </body>
</html> 