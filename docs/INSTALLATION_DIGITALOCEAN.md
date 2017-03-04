# How to install the Open Event Web App Generator on [DigitalOcean.com]

This guide will show you how to deploy Open Event on Digital Ocean. The basic idea is installing Docker on Digital Ocean droplet and then running Open Event in it.

#### Phase 1

* Create a droplet with Ubuntu x64 as the image. At the time of writing this guide, Ubuntu 16.04.1 was used.

* Choose a size with **atleast 1 GB RAM**. We found 512 MB RAM to be insufficient when running Open Event inside Docker.

* Choose other options according to need and then 'Create' the droplet.

* Once droplet has been created, you will get email from DigitalOcean with its information IP Address, username and password.

![droplet_email](https://cloud.githubusercontent.com/assets/4047597/17770515/e2ea6f4c-655b-11e6-9211-78257a083e82.png)

* Open a terminal window and ssh into the server. The command is `ssh USERNAME@IP`. When run, it will ask for the password you got through email. Ctrl-Shift-V to paste the password and ENTER. An example has been given below.

```bash
ssh root@104.236.228.132
# Enter password you got in the email and enter
```

* If you are ssh'ing into your droplet for the first time, you will get a prompt to change password. The step is compulsary so change the password here.
Once this step is done, you will be running the droplet's shell.

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
