# open-event-webapp

[![Join the chat at https://gitter.im/fossasia/open-event-webapp](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/fossasia/open-event-webapp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Open Event Webapp

The Open Event Webapp

[Live version](http://fossasia.github.io/open-event-webapp/)

The webapp is a generic app that has two parts:
a) A standard configuration file, that sets the details of the app (e.g. color scheme, logo of event, link to JSON app data)
b) The webapp itself

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

For deploying locally or making a `dist.zip`, you'll need `bower` and `gulp`
Assuming you have npm (Node Package Manager)
```javascript
npm install
```
This will get all the dependencies that we already have set up in our package.json.

####Deploy local development instance (using Gulp)   

First make sure you have all the dependencies
```javascript
bower update
```

Serve on <http://localhost:8080> with Gulp
`gulp webserver`   
or just   
`gulp`

####Create a distribution-ready folder
After testing out locally using `gulp webserver` and ensuring it works,
you can get a ready-to-deploy `dist` folder

```javascript
gulp dist
```

If you want a minified build (css and js files will be minified)
```javascript
gulp dist-min
```

You can `rsync` or `ftp` the **dist** folder generated to your static web server. 
 
------------------------------------------------------------------------- 
##Technology
 * AngularJS 1.3
 * Bootstrap (or similar) for styling
The webapp will be written using only HTML, CSS and Javascript, so it is completely client-side renderable, on all kinds of browsers, including PCs and smartphones and tablets. 

----------------------------------------------------------------------------
##License
This project is currently licensed under the GNU General Public License v3. A copy of [LICENSE](https://github.com/fossasia/open-event-webapp/blob/master/LICENSE.md) should be present along with the source code. To obtain the software under a different license, please contact FOSSASIA.
