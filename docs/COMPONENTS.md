## Components of the Webapp Genertor

### Webform

The source of the webform can be found [here](/src/www). It consists of - 

 - [index.html](/src/www/index.html) - The webform page
 - [form.js](/src/www/js/form.js) - The script that uploads the zips, and starts the generator process
 
### Generator

The generator runs on a ExpressJS server, using this main [app script](/src/app.js)
The generator has the following components - 

#### Generation scripts

 - [generator.js](/src/backend/generator.js) - Does the main generation tasks, and controls other scripts
 - [fold.js](/src/backend/fold.js) - Groups data of sessions, speakers, tracks etc from JSONs
 - [dist.js](/src/backend/dist.js) - Creates folders, cleans folders, unzips/zips packages
 - [ftpdeploy.js](/src/backend/ftpdeploy.js) - Deploys finished website to organiser's server (optional)
 - [mailer.js](/src/backend/mailer.js) - Sends mail to organiser notifying of successful creation
 
#### Templates

The HTML pages of the generated website are created using Handelbars templates. You can find all the templates [here](/src/backend/templates) - 


 - **footer.hbs** : Common template for footer on all pages
 - **navbar.hbs** : Common template for navbar on all pages
 - **event.hbs** : index.html - Home page
 - **rooms.hbs** : rooms.html - Venues page
 - **schedule.hbs** : tracks.html - Tracks page
 - **speakers.hbs** : speakers.html - Speakers page