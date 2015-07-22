# open-event-webapp

[![Join the chat at https://gitter.im/fossasia/open-event-webapp](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/fossasia/open-event-webapp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Open Event Webapp

The Open Event Webapp

The webapp is a generic app that has two parts: a) A standard configuration file, that sets the details of the app (e.g. color scheme, logo of event, link to JSON app data) b) The webapp itself

----------------------------------------------------------------------------
##Features
This is a client-side webapp, that will be used by attendees of the event. For Android users we have a native android [app](https://github.com/fossasia/open-event-android). This webapp provides similar functionality for platforms other than Android, that is, to be able to view details about - 
 1. Speakers
 2. Sessions
 3. Tracks
 4. Map
from the event, with latest available data. 
It will be responsive, so that it can be viewed from all screen sizes easily. 
The data will be fetched dynamically from the API endpoint provided by the ![orga-server](https://github.com/fossasia/open-event-orga-server). 

----------------------------------------------------------------------------
##Deployment
Currently it is just a simple webapp that can be viewed using any browser. In future, we plan to deploy as a webapp for Ubuntu Phone, Firefox OS etc, who support first class webapps. Also for platforms like iOS, Windows, we might port this usin Ionic/Titanium etc. 

####Deploy local development instance (using Gulp) 
Install Gulp and Gulp-connect packages   
`npm install -g --save-dev gulp gulp-connect`

Serve on localhost:8080 with Gulp
`gulp webserver` or just `gulp`
 
------------------------------------------------------------------------- 
##Technology
 * AngularJS 1.3
 * Bootstrap (or similar) for styling
The webapp will be written using only HTML, CSS and Javascript, so it is completely client-side renderable, on all kinds of browsers, including PCs and smartphones and tablets. 

----------------------------------------------------------------------------
##License
This project is currently licensed under the GNU General Public License v3. A copy of LICENSE.md should be present along with the source code. To obtain the software under a different license, please contact FOSSASIA.
