# How to install the Open Event Web App Generator on AWS

## Phase 1

This phase involves creating the EC2 instance which will hold your app.

* Go to Amazon Web Services console and [select EC2](https://console.aws.amazon.com/ec2/).

* Click on the create button to create an instance. Select Ubuntu 14 x64 as the linux distribution.

* Follow the other steps till you reach the 6th step which is about *configuring Security groups*. There add a rule to accept all HTTP connections. See the screenshot on how
it should look like.

![ec2_security_grp](https://cloud.githubusercontent.com/assets/4047597/17800591/25add494-6602-11e6-9667-437c1626e745.png)

* Click Launch in the 7th step and you will be presented with a dialog to create a key. Create a new key and give it a name. In this tutorial, I will use the name 'mykey'.
Then download the key. Keep it safe because if you lose it, you will lose access to the server.

![ec2_create_key](https://cloud.githubusercontent.com/assets/4047597/17800590/256db530-6602-11e6-9256-30a2e7463148.png)

* Once the instance is created, you will be forwarded to the instances list. Select the newly created instance and click on Connect button. You will see a dialog with instructions on how to connect to it using ssh.

![connect_ssh_ec2](https://cloud.githubusercontent.com/assets/4047597/17800592/25e77262-6602-11e6-8acd-6bd352a30950.png)

* In the above case, the command is as follows. So open the terminal in your Downloads directory (which has the downloaded key file) and then run the command you got from the
previous step. In my case, it was -

```sh
chmod 400 mykey.pem
ssh -i "mykey.pem" ubuntu@ec2-52-41-207-116.us-west-2.compute.amazonaws.com
```

* You will be into the server's shell. You will notice a text message stating to install the language pack. So run the following command.

```sh
sudo apt-get install language-pack-en
```

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
