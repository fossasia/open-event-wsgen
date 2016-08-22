# How to install the Open Event Web App Generator on Google Cloud

## Phase 1
We need to set up a Google Cloud compute instance (VPS), which runs a Linux distro, and has SSH access. 
Other than that, there are no special requirements. 

## Phase 2 
Now we need to install the requirements needed to run it on the server. 

First, update and upgrade all packages to ensure we are up-to-date on everything 

```shell
sudo apt-get update
sudo apt-get upgrade
```

Next we need to install Nodejs to our system. For this project, we recommend you use Nodejs v6.x

```shell
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash - 
sudo apt-get install -y nodejs
```

Also, additionally, install build tools

```shell
sudo apt-get install -y build-essential
```


## Phase 3 

Now you should clone this repository to a folder 

```shell
git clone https://github.com/fossasia/open-event-webapp -b development
```
(Leave use branch master for stable release, development for latest source) 

After that we need to install the dependencies

```shell
cd open-event-webapp
npm install 
```

Run the app

```shell
npm run start
```
or
```shell
npm run server.generator
```

The app will be running on http://localhost:5000

If you want the app to run on port 80, use the following command instead
```shell
sudo PORT=80 npm run start
```

### Note
You'd like to keep the server running persistently, without having to keep ssh connection open. For that case,   

Next install **PM2** (a package manager for Node)    
```shell
sudo npm install -g pm2
```    


Run the app using `pm start npm -- start`

To make the server automatically run on startup, use this command `pm2 startup systemd`

For a detailed tutorial on how to set up Node.js Apps for production usage, checkout https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04