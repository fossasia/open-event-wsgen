# How to install the Open Event Web App Generator on web server

_This is assuming setup on a Linux distro_

To deploy on a web server you need to have **node.js** (v6.x or above) installed.

Please make sure you able to run the app using
```shell
npm run server.generator
```  

Next install **PM2** (a package manager for Node)    
```shell
sudo npm install -g pm2
```    


Run the app using `pm start src/generator/app.js`

To make the server automatically run on startup, use this command `pm2 startup systemd`

For a detailed tutorial on how to set up Node.js Apps for production usage, check out https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
