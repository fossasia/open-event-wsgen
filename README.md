# Open Event Webapp

The Open Event Web App project has two components a) a event website generator and b) the actual generated website output. The web generator application can generate event websites by getting data from event JSON files and binary media files, that are stored in a compressed zip file. You can also access the application through a Rest API. Websites that are generated by the "web app generator" can be uploaded to any web location, e.g. on Github pages or any server (e.g. via ftp).

[![Build Status](https://travis-ci.org/fossasia/open-event-webapp.svg?branch=development)](https://travis-ci.org/fossasia/open-event-webapp?branch=development)
[![Heroku](https://heroku-badge.herokuapp.com/?app=opev-webgen-dev)](http://opev-webgen-dev.herokuapp.com)
[![Dependencies](https://david-dm.org/fossasia/open-event-webapp.svg)](https://david-dm.org/fossasia/open-event-webapp)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c5b7e2ca3e4640c9b38e2f3274072583)](https://www.codacy.com/app/dev_19/open-event-webapp?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=fossasia/open-event-webapp&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/fossasia/open-event-webapp/badges/gpa.svg?branch=development)](https://codeclimate.com/github/fossasia/open-event-webapp)
[![codecov](https://codecov.io/gh/fossasia/open-event-webapp/branch/development/graph/badge.svg)](https://codecov.io/gh/fossasia/open-event-webapp)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/fossasia/open-event-webapp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

##Communication

Please join our mailing list to discuss questions regarding the project: https://groups.google.com/forum/#!forum/open-event

Our chat channel is on gitter here: https://gitter.im/fossasia/open-event-web-app

## 1. Event Website Output

The component that is generator from the web app are the event websites. A sample event site that was generated is added to this repo as a Github Pages site. You can see the live site at http://fossasia.github.io/open-event-webapp/

## 2. Web App Generator

### Components and Technology

The webapp generator used following technologies - 
 1. HTML/CSS/Javascript based frontend
 2. [Node.js](http://nodejs.org) /Javascript for the generator backend
 3. [Express.js](http://expressjs.com) - Server framework
 4. [Handelbars](http://handlebarsjs.com) - Template for rendering
 5. [Socket.io](http://socket.io) - For handling multi-user client, with progress of upload/generation

Please check the [components documentation](/docs/COMPONENTS.md) to learn about the components, and how to change the final outcome of the HTML generated. 

### Configurations
You can find documentation and details of various configurations of the server [here](/docs/CONFIGURATIONS.md) 

### Web App Generator Test Installation

You can try out the web generator at  https://opev-webgen.herokuapp.com

The development version is available here: https://opev-webgen-dev.herokuapp.com

### Installation/Deployment of the Web App Generator

#### How do I install Web App Generator on a Server

Please check out [the documentation here](/docs/INSTALLATION.md).

#### How do I install Web App Generator on my local machine

Please check out [the documentation here](/docs/INSTALLATION_LOCAL.md).

#### How do I install Web App Generator on Google Cloud

To install the system on Google Cloud please refer to the [Google Cloud installation readme](/docs/INSTALLATION_GOOGLE.md).

#### How do I install Web App Generator on AWS

To install the system on AWS please refer to the [AWS installation readme](/docs/INSTALLATION_AWS.md).

#### How do I install Web App Generator on Digital Ocean

To install the system on Digital Ocean please refer to the [Digital Ocean installation readme](/docs/INSTALLATION_DIGITALOCEAN.md).

#### How do I deploy Web App Generator with Heroku

Please read how to deploy to [Heroku here](/docs/INSTALLATION_HEROKU.md)  
Or use the 1-click deployment button  
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/fossasia/open-event-webapp/tree/development)   


## Accessing the Generator Web Form

 - Once deployed, you'll find the generator running on http://localhost:5000, it should look like this  

![Generator Screencast](docs/screenshots/screencast.gif)

 - Add your **email id**, **name of app** (name of event),

 - Then upload the zip file that contains all JSON files for *speakers*, *sessions*, *sponsors*, *event*, *tracks* and *locations* (These you should get from an orga-server or through the API after you have created your event there).

 - Now when you click on **GENERATE APP and DOWNLOAD** button, you'll get to download a zip of the event website.


## Accessing the Generator via REST API

### Endpoints
```
POST /generate 
```

**Parameters `(x-www-form-urlencoded)` or `json`**

| Parameter  | Description | Purpose | 
|---         |---          |---      |
|name|(required) Name of the webapp   | Unique name of the webapp|
|email|(required) Your email id | We will send a email to this when your webapp is ready|
|datasource | (required) Either `jsonupload` or `eventapi` | |
|apiendpoint| (if datasource = eventapi) API endpoint url | |



## Contributions, Bug Reports, Feature Requests

This is an Open Source project and we would be happy to see contributors who report bugs and file feature requests submitting pull requests as well. Please report issues here https://github.com/fossasia/open-event-webapp/issues


## Branch Policy

We have the following branches   
 * **development**   
	 All development goes on in this branch. If you're making a contribution,
	 you are supposed to make a pull request to _development_.
	 PRs to master must pass a build check and a unit-test (_app/src/test_) check on Travis
 * **master**   
   This contains shipped code. After significant features/bugfixes are accumulated on development, we make a version update, and make a release.


## LICENSE

OpenEvent Webapp - A webapp and it's generator, written under the FOSSASIA Open Event project. The Open Event project aims to make server and client software required for hosting events/conferences easy to build and configure. Copyright (C) 2016, FOSSASIA. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.

## Maintainers
The project is maintained by
- Arnav Gupta ([@championswimmer](https://github.com/championswimmer))
- Aayush Arora ([@aayusharora](https://github.com/aayusharora))
- Mario Behling ([@mariobehling](http://github.com/mariobehling))
- Justin Lee ([@juslee](http://github.com/juslee))
